import S3 from '../../model/object-storage';
import { Cloud } from '../../model';
import { decreaseCurrentCapacity, createAncestorsFolderDocs } from '.';
import { applyEscapeString } from '../../util';

const bucketName = process.env.S3_BUCKET_NAME;
const OBJECT_STORAGE_BASE = process.env.S3_BASE_PATH;

interface Directory {
	directory: string;
	name: string;
}
interface FilesFunctionArgs {
	targetIds: string[];
	userLoginId: string;
}
interface FoldersFunctionArgs {
	directories: Directory[];
	userLoginId: string;
}

const removeObjectStorageObjects = async (keys) => {
	if (keys.length === 0) {
		return;
	}
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
			const path = applyEscapeString(`${directory}/${name}`.replace(/\/\/|\//g, '\\/'));

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
			const path = applyEscapeString(`${directory}/${name}`.replace(/\/\/|\//g, '\\/'));

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
			const path = applyEscapeString(`${directory}/${name}`.replace(/\/\/|\//g, '\\/'));

			const docs = await Cloud.find(
				{
					ownerId: userLoginId,
					directory: { $regex: `^${path}(\\/.*)?$` },
				},
				{ osLink: true, size: true, ownerId: true, contentType: true }
			).exec();

			const files = docs.filter((ele) => ele.contentType !== 'folder');
			const totalSize = files.reduce((prev, { size }) => prev + size, 0);
			const keys = files.map(({ osLink }) => {
				return { Key: osLink.replace(`${OBJECT_STORAGE_BASE}/${bucketName}/`, '') };
			});

			const removeOSObjectPromise = removeObjectStorageObjects(keys);
			const decreaseCCPromise = decreaseCurrentCapacity({
				loginId: userLoginId,
				value: totalSize,
			});
			const deleteFolderDocs = Cloud.deleteOne({
				ownerId: userLoginId,
				directory: directory,
				name: name,
			});
			const deleteFileDocs = Cloud.deleteMany({
				ownerId: userLoginId,
				directory: { $regex: `^${path}(\\/.*)?$` },
			});

			await Promise.all([
				removeOSObjectPromise,
				decreaseCCPromise,
				deleteFolderDocs,
				deleteFileDocs,
			]);
		})
	);
};
