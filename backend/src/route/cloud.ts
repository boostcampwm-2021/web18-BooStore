import * as express from 'express';
import { isAuthenticated } from '../middleware';
import upload from '../middleware/multer';
import * as fs from 'fs/promises';

const router = express.Router();

router.post('/upload', isAuthenticated, upload.array('files'), async (req, res) => {
	const files = req.files as Express.Multer.File[];
	
	// TODO 디비에 저장
	
	files.forEach((file) => {
		const { path } = file;
		fs.rm(path);
		
		// 여기서 DB에 저장한 후, promise로 fs.rm()호출해도 좋을듯
	})
	
	res.send();
})

export default router;