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

interface FoldersFunctionArgs {
	directorys: string[];
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

	await S3.upload({
		Bucket: bucketName,
		Key: objectStorageKey,
		ACL: 'public-read',
		// ACL을 지우면 전체공개가 되지 않습니다.
		Body: fs.createReadStream(diskFilePath),
	}).promise();

	const metadata = new Cloud({
		name: originalName,
		size: size,
		ownerId: userLoginId,
		directory: cloudDirectory,
		contentType: mimetype,
		osLink: `${OBJECT_STORAGE_BASE}/${bucketName}/${objectStorageKey}`,
	});

	await metadata.save();

	await increaseCurrentCapacity({ loginId: userLoginId, value: size });
};

const removeObjectStorageObjects = async (keys) => {
	return await S3.deleteObjects({
		Bucket: bucketName,
		Delete: {
			Objects: keys,
		},
	}).promise();
};

export const moveTrashFiles = async ({ targetIds, userLoginId }: FilesFunctionArgs) => {
	const result = await Cloud.updateMany(
		{
			ownerId: userLoginId,
			_id: { $in: targetIds },
		},
		{
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
		const pattern = `${OBJECT_STORAGE_BASE}/boostore/`;
		const patternTest = `${OBJECT_STORAGE_BASE}/${bucketName}/`;
		return { Key: osLink.replace(pattern, '').replace(patternTest, '') };
	});
	removeObjectStorageObjects(keys);

	const totalSize = files.reduce((prev, { size }) => prev + size, 0);
	await decreaseCurrentCapacity({ loginId: userLoginId, value: totalSize });

	await Cloud.deleteMany({
		ownerId: userLoginId,
		_id: { $in: targetIds },
	});
};

export const moveTrashFolders = async ({ directorys, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directorys
			.map((directory) => directory.replace('/', '\\/'))
			.map(async (directory) =>
				Cloud.updateMany(
					{
						ownerId: userLoginId,
						directory: { $regex: `^${directory}(\/.*)?$` },
					},
					{
						isDeleted: true,
					}
				)
			)
	);
};

export const restoreTrashFolders = async ({ directorys, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directorys
			.map((directory) => directory.replace('/', '\\/'))
			.map(async (directory) =>
				Cloud.updateMany(
					{
						ownerId: userLoginId,
						directory: { $regex: `^${directory}(\/.*)?$` },
					},
					{
						isDeleted: false,
					}
				)
			)
	);
};

export const removeFolders = async ({ directorys, userLoginId }: FoldersFunctionArgs) => {
	return Promise.all(
		directorys
			.map((directory) => directory.replace('/', '\\/'))
			.map(async (directory) => {
				const files = await Cloud.find(
					{
						ownerId: userLoginId,
						directory: { $regex: `^${directory}(\/.*)?$` },
					},
					{ osLink: true, size: true, ownerId: true }
				).exec();
				if (files.length === 0) {
					return;
				}

				const keys = files.map(({ osLink }) => {
					const pattern = `${OBJECT_STORAGE_BASE}/boostore/`;
					const patternTest = `${OBJECT_STORAGE_BASE}/${bucketName}/`;
					return { Key: osLink.replace(pattern, '').replace(patternTest, '') };
				});
				removeObjectStorageObjects(keys);

				const totalSize = files.reduce((prev, { size }) => prev + size, 0);
				await decreaseCurrentCapacity({ loginId: userLoginId, value: totalSize });

				await Cloud.deleteMany({
					ownerId: userLoginId,
					directory: { $regex: `^${directory}(\/.*)?$` },
				});
			})
	);
};
