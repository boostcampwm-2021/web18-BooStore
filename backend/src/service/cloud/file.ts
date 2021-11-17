import S3 from '../../model/object-storage';
import * as fs from 'fs';
import * as path from 'path';
import { Cloud } from '../../model';
import { increaseCurrentCapacity } from '.';

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

interface FilesFunctionArgs {
	targetIds: string[];
}

export const removeFiles = async ({ targetIds }: FilesFunctionArgs) => {
	const files = await Cloud.find(
		{
			_id: { $in: targetIds },
		},
		{ osLink: true }
	).exec();
	if (files.length === 0) {
		return;
	}
	
	const keys = files.map(({ osLink }) => {
		const pattern = `${OBJECT_STORAGE_BASE}/boostore/`;
		const patternTest = `${OBJECT_STORAGE_BASE}/${bucketName}/`;
		return { Key: osLink.replace(pattern, '').replace(patternTest, '')};
	})

	S3.deleteObjects({
		Bucket: bucketName,
		Delete: {
			Objects: keys
		}
	}).promise()
	.catch(() => {});
	
	await Cloud.deleteMany({
		_id: { $in: targetIds }
	});
};

export const moveTrashFiles = async ({ targetIds }: FilesFunctionArgs) => {
	const result = await Cloud.updateMany(
		{
			_id: { $in: targetIds },
		},
		{
			isDeleted: true,
		}
	);

	return result.matchedCount;
};