import * as express from 'express';
import * as path from 'path';
import { isAuthenticated } from '../middleware';
import * as fs from 'fs/promises';
import { Cloud } from '../model';
import {
	canIncreaseCurrentCapacity,
	DownloadListMetadataArg,
	getDownloadListMetadata,
	UploadArg,
	uploadFile,
	DownloadFilesArg,
	downloadFiles,
} from '../service/cloud';
import upload from '../middleware/multer';

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
	const { current_dir } = req.query;
	const { files } = req.query;
	const { folders } = req.query;

	if (current_dir === undefined || files === undefined || folders === undefined) {
		return res.status(400).send();
	}

	const fileMetas = await getDownloadListMetadata({
		loginId: loginId,
		currentDir: current_dir as string,
		fileIds: typeof files === 'string' ? [files] : (files as Array<string>),
		directories: typeof folders === 'string' ? [folders] : (folders as Array<string>),
	});
	console.log(fileMetas);

	await downloadFiles({ downloadList: fileMetas });

	return res.download(path.join(path.resolve(), 'temp/', loginId, '/'), 'test0-1.txt');
});

export default router;
