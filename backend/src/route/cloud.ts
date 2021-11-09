import * as express from 'express';

import { isAuthenticated } from '../middleware';
import upload from '../middleware/multer';
import * as fs from 'fs/promises';
import { Cloud } from '../model';
import { canIncreaseCurrentCapacity } from '../service/cloud';

const router = express.Router();

router.get('/validate', isAuthenticated, async (req, res) =>{
	const { size } = req.query;
	!await canIncreaseCurrentCapacity( { loginId: req.user.loginId, value: size} ) ? 
	res.status(409).send() : res.status(200).send();
})

router.post('/upload', isAuthenticated, upload.array('uploadFiles'), async (req, res) => {
	const files = req.files as Express.Multer.File[];

	console.log(files);
	
	files.forEach((file) => {
		const { path } = file;
		fs.rm(path);
		// 여기서 DB에 저장한 후, promise로 fs.rm()호출해도 좋을듯
		const metadata = new Cloud({
			name: file.filename,
			size: file.size,
			ownerId: req.user.loginId,
			contentType: file.mimetype,
		});
		metadata.save()
			.catch((err) => {
				throw err;
			});
	})
	
	res.status(200).send();
})

export default router;