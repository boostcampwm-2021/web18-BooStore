import S3 from '../../model/object-storage';
import * as fs from 'fs';
import * as path from 'path';
import { Cloud, ICloud } from '../../model';
import { increaseCurrentCapacity } from '.';
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

interface updateStarStateArg {
	userLoginId: string;
	targetIds: string;
	state: boolean;
}

export interface GetFilesArg {
	loginId: string;
	regex: string;
	isAscending: boolean;
	isDeleted: boolean;
	isStar: boolean;
}

export interface GetFilteredFilesArg {
	path: string;
	originFiles: ICloud[];
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

const parseFilename = (filename: string) => {
	let realName = filename,
		name = filename,
		numbering = 0,
		ext = '';
	const regex1 = /^(?<name>.*)(?<ext>\..*)$/;
	const match1 = filename.match(regex1);
	if (match1) {
		ext = match1.groups.ext;
		name = match1.groups.name;
		realName = name;
	}

	const regex2 = /^(?<realName>.+)\((?<numbering>\d+)\)$/;
	const match2 = name.match(regex2);
	if (match2) {
		realName = match2.groups.realName;
		numbering = Number(match2.groups.numbering);
	}

	return {
		realName,
		name,
		numbering,
		ext,
		filename,
	};
};

// 중복된 경우, 파일명 뒷부분에 중복 번호를 붙여준다.
// 형식은  파일명(숫자).확장자  형태이다.
// ex) filename.txt,  filename(1).txt,  filename(2).txt
export const getNotOverlappedName = async (
	directory: string,
	filename: string,
	ownerId: string
) => {
	const { realName, ext } = parseFilename(filename);
	let regexStr = `^${applyEscapeString(realName)}`;
	regexStr += `(\\(\\d+\\)|)`;
	regexStr += ext;
	regexStr += `$`;

	const fileDocs = await Cloud.find({
		directory: directory,
		ownerId: ownerId,
		name: {
			$regex: regexStr,
		},
	}).exec();
	if (fileDocs.length === 0) {
		return filename;
	}

	const numbers = fileDocs
		.map((file) => {
			const parsedFilename = parseFilename(file.name);
			return parsedFilename.numbering;
		})
		.sort((a, b) => a - b);
	const leastNumber = numbers.findIndex((ele, index) => ele !== index);

	if (leastNumber === 0) {
		return filename;
	} else if (leastNumber === -1) {
		return `${realName}(${numbers.length})${ext}`;
	} else {
		return `${realName}(${leastNumber})${ext}`;
	}
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

export const getFiles = async ({ loginId, regex, isAscending, isDeleted, isStar }: GetFilesArg) => {
	const files = await Cloud.find(
		{
			directory: { $regex: regex },
			ownerId: loginId,
			isDeleted,
			isStar: { $in: isStar ? [true] : [true, false] },
		},
		{
			directory: true,
			name: true,
			contentType: true,
			createdAt: true,
			updatedAt: true,
			size: true,
			ownerId: true,
			isStar: true,
		},
		{ sort: { name: isAscending ? 'asc' : 'desc' } }
	).exec();
	return files;
};

export const getFilteredFiles = ({ path, originFiles }: GetFilteredFilesArg) => {
	const filteredFiles = [];
	const filteredFolders = [];
	originFiles.map((file) => {
		if (file.directory === path) {
			if (file.contentType === 'folder') {
				filteredFolders.push(file);
			} else {
				filteredFiles.push(file);
			}
		}
	});
	return filteredFolders.concat(filteredFiles);
};

export const splitFolderAndFile = (target: ICloud[]) => {
	const files = [];
	const folders = [];
	target.map((file) => {
		if (file.contentType === 'folder') {
			folders.push(file);
		} else {
			files.push(file);
		}
	});
	return [...folders, ...files];
};
