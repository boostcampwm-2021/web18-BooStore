import * as express from 'express';

import { isAuthenticated } from '../middleware';
import * as fs from 'fs/promises';
import { canIncreaseCurrentCapacity, moveTrashFiles, removeFiles, UploadArg, uploadFile } from '../service/cloud';
import upload from '../middleware/multer';
import { FileEditAction } from '../DTO';

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

router.put('/files', isAuthenticated, async (req, res) => {
	const { targetIds, action } = req.body;
	
	try{
		switch(action) {
			case FileEditAction.trash:
				await moveTrashFiles({ targetIds });
				break;
			case FileEditAction.move:
				break;
		}
		
		res.send();
	}
	catch(err) {
		res.send(500).send();
	}
});

router.delete('/files', isAuthenticated, async (req, res) => {
	const { targetIds } = req.body;
	
	try{
		await removeFiles({ targetIds });
		
		res.send();
	}
	catch(err) {
		res.send(500).send();
	}
})

export default router;
