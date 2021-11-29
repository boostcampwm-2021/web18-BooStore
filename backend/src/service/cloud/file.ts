import S3 from '../../model/object-storage';
import * as fs from 'fs';
import * as path from 'path';
import { Cloud } from '../../model';
import { decreaseCurrentCapacity, increaseCurrentCapacity } from '.';
import { applyEscapeString } from '../../util';

const bucketName = process.env.S3_BUCKET_NAME;
const OBJECT_STORAGE_BASE = process.env.S3_BASE_PATH;

export interface UploadArg {
	originalName: string;
	mimetype: string;
	destination: string;
	fileName: string;
	rootDirectory: string;
	relativePath: string;
	size: number;
	userLoginId: string;
}

interface FilesFunctionArgs {
	targetIds: string[];
	userLoginId: string;
}

interface Directory {
	directory: string;
	name: string;
}
interface FoldersFunctionArgs {
	directories: Directory[];
	userLoginId: string;
}

interface updateStarStateArg {
	userLoginId: string;
	targetIds: string;
	state: boolean;
}

export const uploadFile = async ({
	originalName,
	mimetype,
	destination,
	fileName,
	rootDirectory,
	relativePath,
	size,
	userLoginId,
}: UploadArg) => {
	const objectStorageKey = path.join(userLoginId, fileName).replace(/\\\\|\\/g, '/');
	const diskFilePath = path.join(destination, fileName);
	const cloudDirectory = path
		.join(rootDirectory, relativePath.split('/').slice(0, -1).join('/'))
		.replace(/\\\\|\\/g, '/');

	try {
		const s3Promise = S3.upload({
			Bucket: bucketName,
			Key: objectStorageKey,
			ACL: 'public-read',
			Body: fs.createReadStream(diskFilePath),
		}).promise();

		const cafPromise = createAncestorsFolderDocs(cloudDirectory, userLoginId);

		const notOverlappedName = await getNotOverlappedName(
			cloudDirectory,
			originalName,
			userLoginId
		);

		const cloudPromise = Cloud.create({
			name: notOverlappedName,
			size: size,
			ownerId: userLoginId,
			directory: cloudDirectory,
			contentType: mimetype,
			osLink: `${OBJECT_STORAGE_BASE}/${bucketName}/${objectStorageKey}`,
		});

		await Promise.all([cafPromise, s3Promise, cloudPromise]);

		await increaseCurrentCapacity({ loginId: userLoginId, value: size });
	} catch (err) {
		throw new Error(err);
	}
};

// 중복된 경우, 파일명 뒷부분에 중복 번호를 붙여준다.
// 형식은  파일명(숫자).확장자  형태이다.
// ex) filename.txt,  filename(1).txt,  filename(2).txt
export const getNotOverlappedName = async (
	directory: string,
	filename: string,
	ownerId: string
) => {
	const fileDoc = await Cloud.findOne({
		name: filename,
		directory: directory,
		ownerId: ownerId,
	}).exec();
	if (!fileDoc) {
		return filename;
	}

	let extIndex = filename.lastIndexOf('.');
	if (extIndex === -1) {
		extIndex = filename.length;
	}
	const name = filename.slice(0, extIndex);
	const ext = filename.slice(extIndex);
	const leftBracketIndex = name.lastIndexOf('(');
	const rightBracketIndex = name.lastIndexOf(')');

	if (
		leftBracketIndex === -1 ||
		rightBracketIndex === -1 ||
		rightBracketIndex !== name.length - 1 ||
		leftBracketIndex + 1 >= rightBracketIndex
	) {
		return await getNotOverlappedName(directory, `${name}(1)${ext}`, ownerId);
	}

	const strInsideBracket = name.slice(leftBracketIndex + 1, rightBracketIndex);
	const overlapNumber = Number(strInsideBracket);
	if (isNaN(overlapNumber)) {
		return await getNotOverlappedName(directory, `${name}(1)${ext}`, ownerId);
	}

	const newFilename = `${name.slice(0, leftBracketIndex)}(${overlapNumber + 1})${ext}`;
	return await getNotOverlappedName(directory, newFilename, ownerId);
};

export const createAncestorsFolderDocs = async (curDirectory: string, userLoginId: string) => {
	if (curDirectory === '/') {
		return;
	}

	const folders = curDirectory
		.split('/')
		.slice(1)
		.reduce(
			(prev, cur) => {
				const { directory, name } = prev[prev.length - 1];

				const curFolder = {
					directory: directory === '/' ? `/${name}` : `${directory}/${name}`,
					name: cur,
				};

				return prev.concat([curFolder]);
			},
			[{ directory: '', name: '' }]
		)
		.slice(1);

	return await Promise.all(
		folders.map(async (folder) => {
			const { directory, name } = folder;
			return await Cloud.findOneAndUpdate(
				{
					directory,
					name,
					ownerId: userLoginId,
				},
				{
					size: 0,
					contentType: 'folder',
				},
				{
					new: true,
					upsert: true,
				}
			).exec();
		})
	);
};

export const getNewFolder = async (loginId: string, parentDir: string, curDir: string) => {
	const newFolder = await Cloud.findOne({
		ownerId: loginId,
		directory: parentDir,
		name: curDir,
	});
	return newFolder;
};

export const updateFile = async (
	loginId: string,
	curDir: string,
	fileName: string,
	newDir: string
) => {
	const notOverlappedFilename = await getNotOverlappedName(newDir, fileName, loginId);

	return await Cloud.updateOne(
		{
			ownerId: loginId,
			directory: curDir,
			name: fileName,
		},
		{
			directory: newDir,
			name: notOverlappedFilename,
		}
	);
};

const removeObjectStorageObjects = async (keys) => {
	return await S3.deleteObjects({
		Bucket: bucketName,
		Delete: {
			Objects: keys,
		},
	}).promise();
};

export const getFilesForUpdate = async (loginId: string, curDir: string) => {
	const filesForUpdate = await Cloud.find(
		{
			ownerId: loginId,
			directory: curDir,
			isDeleted: false,
		},
		{
			osLink: false,
			idDeleted: false,
		}
	);

	return filesForUpdate;
};

export const getTrashFiles = async (userLoginId: string) => {
	const docs = await Cloud.find({
		ownerId: userLoginId,
		isDeleted: true,
	});

	const folders = docs.filter((doc) => doc.contentType === 'folder');
	const files = docs.filter((doc) => doc.contentType !== 'folder');

	const directories = folders.map((folder) =>
		`${folder.directory}/${folder.name}`.replace(/\/\/|\//g, '\\/')
	);

	const foldersOutsideFolder = directories.reduce(
		(result, directory) => {
			const regex = new RegExp(`^${applyEscapeString(directory)}(\\/.*)?$`);

			return result.filter((folder) => !regex.test(folder.directory));
		},
		[...folders]
	);
	const filesOutsideFolder = directories.reduce(
		(result, directory) => {
			const regex = new RegExp(`^${applyEscapeString(directory)}(\\/.*)?$`);

			return result.filter((file) => !regex.test(file.directory));
		},
		[...files]
	);

	return [...filesOutsideFolder, ...foldersOutsideFolder];
};

export const moveFilesToTrash = async ({ targetIds, userLoginId }: FilesFunctionArgs) => {
	const result = await Cloud.updateMany(
		{
			ownerId: userLoginId,
			_id: { $in: targetIds },
		},
		{
			deletedAt: new Date(),
			isDeleted: true,
		}
	);
	return result.matchedCount;
};

export const restoreTrashFiles = async ({ targetIds, userLoginId }: FilesFunctionArgs) => {
	const files = await Cloud.find({
		ownerId: userLoginId,
		_id: { $in: targetIds },
	});

	const directories = files.reduce((result, file) => {
		result.add(file.directory);
		return result;
	}, new Set<string>());

	const createAncFolderPromise = Promise.all(
		[...directories].map((directory) => createAncestorsFolderDocs(directory, userLoginId))
	);

	const updateDocsPromise = Cloud.updateMany(
		{
			ownerId: userLoginId,
			_id: { $in: targetIds },
		},
		{
			isDeleted: false,
		}
	).exec();

	await Promise.all([createAncFolderPromise, updateDocsPromise]);
};

export const removeFiles = async ({ targetIds, userLoginId }: FilesFunctionArgs) => {
	const files = await Cloud.find(
		{
			ownerId: userLoginId,
			_id: { $in: targetIds },
		},
		{ osLink: true, size: true, ownerId: true }
	).exec();
	if (files.length === 0) {
		return;
	}

	const totalSize = files.reduce((prev, { size }) => prev + size, 0);
	const keys = files.map(({ osLink }) => {
		return { Key: osLink.replace(`${OBJECT_STORAGE_BASE}/${bucketName}/`, '') };
	});

	const removeOSObjectPromise = removeObjectStorageObjects(keys);
	const decreaseCCPromise = decreaseCurrentCapacity({ loginId: userLoginId, value: totalSize });
	const deleteDocs = Cloud.deleteMany({
		ownerId: userLoginId,
		_id: { $in: targetIds },
	});

	await Promise.all([removeOSObjectPromise, decreaseCCPromise, deleteDocs]);
};

export const moveFoldersToTrash = async ({ directories, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directories.flatMap((ele) => {
			const { directory, name } = ele;
			const path = applyEscapeString(
				`${directory}/${name}`.replace('//', '/').replace(/\//g, '\\/')
			);

			const moveFolderPromise = Cloud.updateOne(
				{
					ownerId: userLoginId,
					directory: directory,
					name: name,
					isDeleted: false,
				},
				{
					deletedAt: new Date(),
					isDeleted: true,
				}
			).exec();
			const moveFilesPromise = Cloud.updateMany(
				{
					ownerId: userLoginId,
					directory: { $regex: `^${path}(\\/.*)?$` },
					isDeleted: false,
				},
				{
					deletedAt: new Date(),
					isDeleted: true,
				}
			).exec();

			return [moveFolderPromise, moveFilesPromise];
		})
	);
};

export const restoreTrashFolders = async ({ directories, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directories.map(async (ele) => {
			const { directory, name } = ele;
			const path = applyEscapeString(
				`${directory}/${name}`.replace('//', '/').replace(/\//g, '\\/')
			);

			const files = await Cloud.find({
				ownerId: userLoginId,
				directory: { $regex: `^${path}(\\/.*)?$` },
				isDeleted: true,
			});
			const directories = files.reduce((result, file) => {
				result.add(file.directory);
				return result;
			}, new Set<string>());

			const createDirPromise = Promise.all(
				[...directories].map((directory) =>
					createAncestorsFolderDocs(directory, userLoginId)
				)
			);

			const moveFolderPromise = Cloud.updateOne(
				{
					ownerId: userLoginId,
					directory: directory,
					name: name,
					isDeleted: true,
				},
				{
					isDeleted: false,
				}
			).exec();
			const moveFilesPromise = Cloud.updateMany(
				{
					ownerId: userLoginId,
					directory: { $regex: `^${path}(\\/.*)?$` },
					isDeleted: true,
				},
				{
					isDeleted: false,
				}
			).exec();

			return [moveFolderPromise, moveFilesPromise, createDirPromise];
		})
	);
};

export const removeFolders = async ({ directories, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directories.map(async (ele) => {
			const { directory, name } = ele;
			const path = applyEscapeString(
				`${directory}/${name}`.replace('//', '/').replace(/\//g, '\\/')
			);

			const files = await Cloud.find(
				{
					ownerId: userLoginId,
					directory: { $regex: `^${path}(\\/.*)?$` },
				},
				{ osLink: true, size: true, ownerId: true }
			).exec();

			const keys = files.map(({ osLink }) => {
				return { Key: osLink.replace(`${OBJECT_STORAGE_BASE}/${bucketName}/`, '') };
			});
			removeObjectStorageObjects(keys);

			const totalSize = files.reduce((prev, { size }) => prev + size, 0);
			await decreaseCurrentCapacity({ loginId: userLoginId, value: totalSize });

			Cloud.deleteOne({
				ownerId: userLoginId,
				directory: directory,
				name: name,
			}).exec();
			await Cloud.deleteMany({
				ownerId: userLoginId,
				directory: { $regex: `^${path}(\\/.*)?$` },
			});
		})
	);
};

export const updateStarStatus = async ({ userLoginId, targetIds, state }: updateStarStateArg) => {
	const result = await Cloud.updateMany(
		{
			ownerId: userLoginId,
			_id: { $in: targetIds },
		},
		{
			isStar: state,
		}
	);
	return result.matchedCount;
};
