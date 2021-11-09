import * as express from 'express';
import { upload }  from '../service/cloud';

const router = express.Router();

router.get('/upload',async(req,res)=>{
	await upload();
	res.send("upload success????");
})

export default router;