import * as express from 'express';
import upload from '../model/object-storage';

const router = express.Router();

router.get('/upload',async(req,res)=>{
	await upload();
	res.send("upload success????");
})

export default router;