import S3 from '../../model/object-storage';
import * as fs from 'fs';
import * as path from 'path';
import { Cloud } from '../../model';
import { decreaseCurrentCapacity, increaseCurrentCapacity } from '.';

const bucketName = process.env.S3_BUCKET_NAME;
const OBJECT_STORAGE_BASE = 'https://kr.object.ncloudstorage.com';

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
	const objectStorageKey = path
		.join(userLoginId, fileName)
		.split(/\\\\|\\/)
		.join('/');
	const diskFilePath = path.join(destination, fileName);
	const cloudDirectory = path
		.join(rootDirectory, relativePath.split('/').slice(0, -1).join('/'))
		.split(/\\\\|\\/)
		.join('/');

	const s3Promise = S3.upload({
		Bucket: bucketName,
		Key: objectStorageKey,
		ACL: 'public-read',
		Body: fs.createReadStream(diskFilePath),
	}).promise();

	const cafPromise = createAncestorsFolder(cloudDirectory, userLoginId);

	const cloudPromise = Cloud.create({
		name: originalName,
		size: size,
		ownerId: userLoginId,
		directory: cloudDirectory,
		contentType: mimetype,
		osLink: `${OBJECT_STORAGE_BASE}/${bucketName}/${objectStorageKey}`,
	});

	await Promise.all([cafPromise, s3Promise, cloudPromise]);

	await increaseCurrentCapacity({ loginId: userLoginId, value: size });
};

// /test2/폴더어/폴더어2/test.txt -> /test2/폴더어/폴더어2
export const createAncestorsFolder = async (curDirectory: string, userLoginId: string) => {
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

export const getNewFolder = async(loginId: string, parentDir: string, curDir: string) => {
	const newFolder = await Cloud.findOne({
		ownerId: loginId,
		directory: parentDir,
		name: curDir
	});
	return newFolder;
}

const removeObjectStorageObjects = async (keys) => {
	return await S3.deleteObjects({
		Bucket: bucketName,
		Delete: {
			Objects: keys,
		},
	}).promise();
};

export const getTrashFiles = async (userLoginId: string) => {
	const docs = await Cloud.find({
		ownerId: userLoginId,
		isDeleted: true,
	});

	const folders = docs.filter((doc) => doc.contentType === 'folder');
	const files = docs.filter((doc) => doc.contentType !== 'folder');

	const directories = folders.map((folder) =>
		`${folder.directory}/${folder.name}`.replace(/\/\//g, '/').replace(/\//g, '\\/')
	);

	const foldersOutsideFolder = directories.reduce(
		(result, directory) => {
			const regex = new RegExp(`^${directory}(\\/.*)?$`);

			return result.filter((folder) => !regex.test(folder.directory));
		},
		[...folders]
	);
	const filesOutsideFolder = directories.reduce(
		(result, directory) => {
			const regex = new RegExp(`^${directory}(\\/.*)?$`);

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
	const result = await Cloud.updateMany(
		{
			ownerId: userLoginId,
			_id: { $in: targetIds },
		},
		{
			isDeleted: false,
		}
	);

	return result.matchedCount;
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

	const keys = files.map(({ osLink }) => {
		const pattern = `${OBJECT_STORAGE_BASE}/${bucketName}/`;
		return { Key: osLink.replace(pattern, '') };
	});
	removeObjectStorageObjects(keys);

	const totalSize = files.reduce((prev, { size }) => prev + size, 0);
	await decreaseCurrentCapacity({ loginId: userLoginId, value: totalSize });

	await Cloud.deleteMany({
		ownerId: userLoginId,
		_id: { $in: targetIds },
	});
};

export const moveFoldersToTrash = async ({ directories, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directories.flatMap((ele) => {
			const { directory, name } = ele;
			const path = `${directory}/${name}`.replace('//', '/').replace(/\//g, '\\/');

			const promise1 = Cloud.updateOne(
				{
					ownerId: userLoginId,
					directory: directory,
					name: name,
				},
				{
					deletedAt: new Date(),
					isDeleted: true,
				}
			).exec();
			const promise2 = Cloud.updateMany(
				{
					ownerId: userLoginId,
					directory: { $regex: `^${path}(\\/.*)?$` },
				},
				{
					deletedAt: new Date(),
					isDeleted: true,
				}
			).exec();

			return [promise1, promise2];
		})
	);
};

export const restoreTrashFolders = async ({ directories, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directories.map(async (ele) => {
			const { directory, name } = ele;
			const path = `${directory}/${name}`.replace('//', '/').replace(/\//g, '\\/');

			const promise1 = Cloud.updateOne(
				{
					ownerId: userLoginId,
					directory: directory,
					name: name,
				},
				{
					deletedAt: new Date(),
					isDeleted: false,
				}
			).exec();
			const promise2 = Cloud.updateMany(
				{
					ownerId: userLoginId,
					directory: { $regex: `^${path}(\\/.*)?$` },
				},
				{
					deletedAt: new Date(),
					isDeleted: false,
				}
			).exec();

			return [promise1, promise2];
		})
	);
};

export const removeFolders = async ({ directories, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directories
			.map((ele) => {
				const { directory, name } = ele;
				return {
					directory: directory.replace(/\//g, '\\/'),
					name: name,
				};
			})
			.map(async (directory) => {
				const files = await Cloud.find(
					{
						ownerId: userLoginId,
						directory: { $regex: `^${directory}(\\/.*)?$` },
					},
					{ osLink: true, size: true, ownerId: true }
				).exec();
				if (files.length === 0) {
					return;
				}

				const keys = files.map(({ osLink }) => {
					const pattern = `${OBJECT_STORAGE_BASE}/${bucketName}/`;
					return { Key: osLink.replace(pattern, '') };
				});
				removeObjectStorageObjects(keys);

				const totalSize = files.reduce((prev, { size }) => prev + size, 0);
				await decreaseCurrentCapacity({ loginId: userLoginId, value: totalSize });

				await Cloud.deleteMany({
					ownerId: userLoginId,
					directory: { $regex: `^${directory}(\\/.*)?$` },
				});
			})
	);
};
