import S3 from '../../model/object-storage';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { Cloud, ICloud } from '../../model';
import { isValidObjectId } from 'mongoose';
import AdmZip = require('adm-zip');

const bucketName = process.env.S3_BUCKET_NAME;
const OBJECT_STORAGE_BASE = 'https://kr.object.ncloudstorage.com';

// 전체 다운로드 리스트
export interface DownloadListMetadataArg {
	loginId: string;
	currentDir: string;
	fileIds: Array<string>;
	directories: Array<string>;
}

export const getDownloadListMetadata = async ({
	loginId,
	currentDir,
	fileIds,
	directories,
}: DownloadListMetadataArg) => {
	const files = Promise.all(
		fileIds.filter(isValidObjectIdHandle).map((fileId) => {
			return getDownloadFileMetadata({ fileId, loginId });
		})
	);

	const folders = Promise.all(
		directories.map((directory) => {
			if (directory === '') return [];
			return getDownloadFolderMetadata({
				directory: (currentDir === '/' ? currentDir : currentDir + '/') + directory,
				loginId,
			});
		})
	);

	const reducer = function (acc, cur) {
		acc.push(...cur);
		return acc;
	};

	const transFiles = (await files).reduce(reducer, []);
	const transFolders = (await folders).reduce(reducer, []);

	return [...transFiles, ...transFolders];
};

function isValidObjectIdHandle(fileId: string) {
	return isValidObjectId(fileId);
}

// 전체 다운로드 리스트 중 파일만
export interface DownloadFileMetadataArg {
	fileId: string;
	loginId: string;
}

const getDownloadFileMetadata = async ({ fileId, loginId }: DownloadFileMetadataArg) => {
	const fileMetadata = Cloud.find({
		_id: fileId,
		ownerId: loginId,
	}).exec();
	return fileMetadata;
};

// 전체 다운로드 리스트 중 폴더만
export interface DownloadFolderMetadataArg {
	directory: string;
	loginId: string;
}

const getDownloadFolderMetadata = async ({ directory, loginId }: DownloadFolderMetadataArg) => {
	const folderMetadata = await Cloud.find({
		directory: { $regex: `^${directory}(\\/.*)?$` },
		ownerId: loginId,
	}).exec();
	return folderMetadata;
};

// 실제 파일 다운로드

const getDownloadPath = (currentDirectory: string, fileDirectory: string) => {
	const slicedDirectory = fileDirectory.slice(currentDirectory.length);
	return slicedDirectory === '' ? '/' : slicedDirectory;
};

export interface DownloadFilesArg {
	downloadList: ICloud[];
	currentDir: string;
}

export const downloadFiles = async ({ downloadList, currentDir }: DownloadFilesArg) => {
	return Promise.all(
		downloadList.map(async (file) => {
			const pattern = `${OBJECT_STORAGE_BASE}/${bucketName}/`;
			const key = file.osLink.replace(pattern, '');
			await mkdirp(
				path.join(
					path.resolve(),
					'temp/',
					file.ownerId,
					'/',
					getDownloadPath(currentDir, file.directory),
					'/'
				)
			);
			const localPath = path.join(
				path.resolve(),
				'temp/',
				file.ownerId,
				'/',
				getDownloadPath(currentDir, file.directory),
				'/',
				file.name
			);

			await downloadObjectStorageFiles(localPath, key);
		})
	);
};

const downloadObjectStorageFiles = (localPath, key) => {
	return new Promise((res, rej) => {
		const outStream = fs.createWriteStream(localPath);
		const inStream = S3.getObject({
			Bucket: bucketName,
			Key: key,
		}).createReadStream();
		const stream = inStream.pipe(outStream);

		stream.on('error', (err) => {
			rej(err);
		});

		stream.on('finish', () => {
			res(true);
		});
	});
};

export interface ZipFileFunctionArg {
	targetFolderPath: string;
	zipFolderPath: string;
}

export const createZipFile = ({ targetFolderPath, zipFolderPath }: ZipFileFunctionArg) => {
	const zip = new AdmZip();
	zip.addLocalFolder(targetFolderPath);
	zip.writeZip(zipFolderPath);
};

export const deleteZipFile = ({ targetFolderPath, zipFolderPath }: ZipFileFunctionArg) => {
	fs.rm(targetFolderPath, { recursive: true }, () => {});
	fs.rm(zipFolderPath, { recursive: true }, () => {});
};
