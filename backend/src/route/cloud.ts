import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';

import { FileEditAction } from '../DTO';
import { isAuthenticated, upload } from '../middleware';
import {
	canIncreaseCurrentCapacity,
	getDownloadListMetadata,
	UploadArg,
	uploadFile,
	downloadFiles,
	moveFilesToTrash,
	moveFoldersToTrash,
	removeFiles,
	restoreTrashFiles,
	restoreTrashFolders,
	removeFolders,
	createZipFile,
	deleteZipFile,
	updateStarStatus,
	createAncestorsFolder,
	getNewFolder,
	getTrashFiles,
	updateDir,
	splitFolderAndFile,
	FilteredFilesArg,
	FilesArg,
	getFilteredFiles,
	getFiles,
} from '../service/cloud';
import { applyEscapeString } from '../util';
const router = express.Router();

router.get('/validate', isAuthenticated, async (req, res) => {
	const { size } = req.query;
	const { loginId } = req.user;
	const value = Number(size);
	if (isNaN(value) || size.length === 0) {
		return res.status(400).send();
	}

	if (await canIncreaseCurrentCapacity({ loginId, value })) {
		return res.status(200).send();
	} else {
		return res.status(409).send();
	}
});

router.post('/upload', isAuthenticated, upload.array('uploadFiles'), async (req, res) => {
	const files = req.files as Express.Multer.File[];
	const { loginId } = req.user;
	const { relativePath, rootDirectory } = req.body;
	if (loginId === undefined || relativePath === undefined || rootDirectory === undefined) {
		return res.status(400).send();
	}

	const relativePaths = JSON.parse(relativePath);
	try {
		const totalSize = files.reduce((prev, file) => prev + file.size, 0);
		if (!(await canIncreaseCurrentCapacity({ loginId: loginId, value: totalSize }))) {
			return res.status(403).send();
		}

		await Promise.all(
			files.map(async (file) => {
				const { path, size, originalname, mimetype, filename, destination } = file;
				const uploadArg: UploadArg = {
					originalName: originalname,
					mimetype: mimetype,
					fileName: filename,
					destination: destination,
					rootDirectory: rootDirectory,
					relativePath: relativePaths[originalname],
					size: size,
					userLoginId: loginId,
				};

				await uploadFile(uploadArg);

				fs.rm(path);
			})
		);

		return res.status(200).send();
	} catch (err) {
		return res.status(500).send();
	}
});

router.get('/download', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const { current_dir, files, folders } = req.query;

	if (current_dir === undefined || files === undefined || folders === undefined) {
		return res.status(400).send();
	}

	const metadataList = await getDownloadListMetadata({
		loginId: loginId,
		currentDir: current_dir as string,
		fileIds: typeof files === 'string' ? [files] : (files as Array<string>),
		directories: typeof folders === 'string' ? [folders] : (folders as Array<string>),
	});
	await downloadFiles({ downloadList: metadataList, currentDir: current_dir as string });
	const targetFolderPath = path.join(path.resolve(), 'temp', loginId);
	const zipFolderPath = path.join(path.resolve(), 'temp', `${loginId}.zip`);

	createZipFile({ targetFolderPath, zipFolderPath });
	res.download(zipFolderPath, `${loginId}.zip`, (err) => {
		if (err) {
			res.status(500).send();
		} else {
			res.send();
		}
	});
	deleteZipFile({ targetFolderPath, zipFolderPath });

	return;
});

router.patch('/files', isAuthenticated, async (req, res) => {
	const { targetIds = [], directories = [], action, newdir = "", curdir = "" } = req.body;
	const { loginId } = req.user;
	const { targetIds = [], directories = [], action } = req.body;
	if (loginId === undefined) {
		return res.status(400).send();
	}
	if (targetIds === undefined || directories === undefined || action === undefined) {
		return res.status(400).send();
	}
	try {
		switch (action) {
			case FileEditAction.trash:
				await moveFilesToTrash({ targetIds, userLoginId: loginId });
				await moveFoldersToTrash({ directories, userLoginId: loginId });
				break;
			case FileEditAction.restore:
				await restoreTrashFiles({ targetIds, userLoginId: loginId });
				await restoreTrashFolders({ directories, userLoginId: loginId });
				break;
			case FileEditAction.move:
				await updateDir(loginId, targetIds, newdir, curdir);
				break;
			case FileEditAction.addStar:
				await updateStarStatus({ userLoginId: loginId, targetIds: targetIds, state: true });
				break;
			case FileEditAction.removeStar:
				await updateStarStatus({
					userLoginId: loginId,
					targetIds: targetIds,
					state: false,
				});
				break;
			default:
				return res.status(400).send('invalid action');
		}
		return res.status(200).send();
	} catch (err) {
		return res.status(500).send();
	}
});

router.delete('/files', isAuthenticated, async (req, res) => {
	const { targetIds = [], directories = [] } = req.body;
	const { loginId } = req.user;

	try {
		await removeFiles({ targetIds, userLoginId: loginId });
		await removeFolders({ directories, userLoginId: loginId });

		res.send();
	} catch (err) {
		res.status(500).send();
	}
});

router.post('/newfolder', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const { name, curdir } = req.body;
	const folderName = name.newFolderName;
	const curDir = curdir.curDir;
	let newDir = curDir + folderName;
	if (curDir != '/') {
		newDir = curDir + '/' + folderName;
	}
	try {
		await createAncestorsFolder(newDir, loginId);
		const newFolder = await getNewFolder(loginId, curDir, folderName);
		if(newFolder===null){
			return res.status(503).send();
		}
		return res.json(newFolder);
	} catch (err) {
		return res.sendStatus(503);
	}
});

router.get('/trash', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;

	try {
		const files = await getTrashFiles(loginId);

		return res.json(files);
	} catch (err) {
		return res.status(500).send();
	}
});

router.post('/update', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const { files, newdir, curDirectory } = req.body;
	await updateDir(loginId, files, newdir, curDirectory);
	return res.send();
});

router.get('/files', isAuthenticated, async (req, res) => {
	const { path, isAscending, isDeleted, isStar } = req.query;
	const { loginId } = req.user;
	if (path === undefined || isAscending === undefined || isDeleted === undefined) {
		return res.status(400).send();
	}
	if (path === '') {
		return res.status(400).send();
	}

	try {
		const filesArg: FilesArg = {
			loginId: loginId,
			regex: `(^${applyEscapeString(path as string)}$)|(^${
				path === '/' ? '' : applyEscapeString(path as string)
			}/(.*)?$)`,
			isAscending: isAscending === 'true',
			isDeleted: isDeleted === 'true',
			isStar: isStar === 'true',
		};

		const tempFiles = await getFiles(filesArg);

		const filteredFilesArg: FilteredFilesArg = {
			path: path as string,
			originFiles: tempFiles,
		};

		const files = getFilteredFiles(filteredFilesArg);
		return res.status(200).json(files);
	} catch (err) {
		return res.status(500).send();
	}
});

router.get('/starfiles', isAuthenticated, async (req, res) => {
	const { path, isAscending } = req.query;
	const { loginId } = req.user;
	if (path === undefined || isAscending === undefined) {
		return res.status(400).send();
	}
	if (path === '') {
		return res.status(400).send();
	}

	const filesArg: FilesArg = {
		loginId: loginId,
		regex: `.+`,
		isAscending: isAscending === 'true',
		isDeleted: false,
		isStar: true,
	};
	try {
		const tempFiles = await getFiles(filesArg);
		const data = splitFolderAndFile(tempFiles);
		return res.status(200).json(data);
	} catch (err) {
		return res.status(500).send();
	}
});

export default router;
