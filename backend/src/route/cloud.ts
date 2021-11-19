import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';

import { FileEditAction } from '../DTO';
import { isAuthenticated, upload } from '../middleware';
import {
	canIncreaseCurrentCapacity,
	DownloadListMetadataArg,
	getDownloadListMetadata,
	UploadArg,
	uploadFile,
	DownloadFilesArg,
	downloadFiles,
	moveTrashFiles,
	moveTrashFolders,
	removeFiles,
	restoreTrashFiles,
	restoreTrashFolders,
	removeFolders,
	createZipFile,
	deleteZipFile,
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
	const body = req.body;
	const relativePath = JSON.parse(body.relativePath);

	for await (const file of files) {
		const { path, size, originalname, mimetype, filename, destination } = file;
		const uploadArg: UploadArg = {
			originalName: originalname,
			mimetype: mimetype,
			fileName: filename,
			destination: destination,
			rootDirectory: body.rootDirectory,
			relativePath: relativePath[originalname],
			size: size,
			userLoginId: loginId,
		};

		await uploadFile(uploadArg);

		fs.rm(path);
	}

	res.status(200).send();
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
	await downloadFiles({ downloadList: metadataList });
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
	const { targetIds = [], directorys = [], action } = req.body;
	const { loginId } = req.user;

	try {
		switch (action) {
			case FileEditAction.trash:
				await moveTrashFiles({ targetIds, userLoginId: loginId });
				await moveTrashFolders({ directorys, userLoginId: loginId });
				break;
			case FileEditAction.restore:
				await restoreTrashFiles({ targetIds, userLoginId: loginId });
				await restoreTrashFolders({ directorys, userLoginId: loginId });
				break;
			case FileEditAction.move:
				break;
		}

		res.send();
	} catch (err) {
		res.send(500).send();
	}
});

router.delete('/files', isAuthenticated, async (req, res) => {
	const { targetIds = [], directorys = [] } = req.body;
	const { loginId } = req.user;

	try {
		await removeFiles({ targetIds, userLoginId: loginId });
		await removeFolders({ directorys, userLoginId: loginId });

		res.send();
	} catch (err) {
		res.send(500).send();
	}
});

export default router;
