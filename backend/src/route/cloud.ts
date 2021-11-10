import * as express from 'express';

import { isAuthenticated } from '../middleware';
import * as fs from 'fs/promises';
import { Cloud } from '../model';
import { canIncreaseCurrentCapacity, UploadArg, uploadFile } from '../service/cloud';
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

	files.forEach((file) => {
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

		uploadFile(uploadArg).then(() => {
			fs.rm(path);
		});
	});

	res.status(200).send();
});

export default router;
