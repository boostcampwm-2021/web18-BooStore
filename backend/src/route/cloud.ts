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
	createAncestorsFolder,
	getNewFolder,
	getTrashFiles,
	updateStarStatus,
} from '../service/cloud';

const router = express.Router();

router.get('/validate', isAuthenticated, async (req, res) => {
	const { size } = req.query;
	const value = Number(size);
	if (isNaN(value)) {
		return res.status(400).send();
	}

	!(await canIncreaseCurrentCapacity({ loginId: req.user.loginId, value }))
		? res.status(409).send()
		: res.status(200).send();
});

router.post('/upload', isAuthenticated, upload.array('uploadFiles'), async (req, res) => {
	const files = req.files as Express.Multer.File[];
	const { loginId } = req.user;
	const { relativePath, rootDirectory } = req.body;
	const relativePaths = JSON.parse(relativePath);

	try {
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

		res.status(200).send();
	} catch (err) {
		res.status(500).send();
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
	const targetFolderPath = path.join(path.resolve(), 'temp/', loginId);
	const zipFolderPath = path.join(path.resolve(), 'temp/', `${loginId}.zip`);

	createZipFile({ targetFolderPath, zipFolderPath });
	res.download(zipFolderPath, `${loginId}.zip`, (err) => {
		if (!err) {
			res.send();
		}
	});
	deleteZipFile({ targetFolderPath, zipFolderPath });

	return;
});

router.put('/files', isAuthenticated, async (req, res) => {
	const { targetIds = [], directories = [], action } = req.body;
	const { loginId } = req.user;
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
		}

		res.send();
	} catch (err) {
		res.status(500).send();
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
	let newDir = curdir.curDir + name.newFolderName;
	if (curdir.curDir != '/') {
		newDir = curdir.curDir + '/' + name.newFolderName;
	}
	try {
		await createAncestorsFolder(newDir, loginId);
		const newFolder = await getNewFolder(loginId, curdir.curDir, name.newFolderName);
		return res.json(newFolder);
	} catch (err) {
		res.sendStatus(304);
	}
});
router.get('/trash', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;

	const files = await getTrashFiles(loginId);

	return res.json(files);
});
router.post('/newfolder', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const { name, curdir } = req.body;
	let newDir = curdir.curDir + name.newFolderName;
	if (curdir.curDir != '/') {
		newDir = curdir.curDir + '/' + name.newFolderName;
	}
	try {
		await createAncestorsFolder(newDir, loginId);
		const newFolder = await getNewFolder(loginId, curdir.curDir, name.newFolderName);
		return res.json(newFolder);
	} catch (err) {
		res.sendStatus(304);
	}
});

export default router;
