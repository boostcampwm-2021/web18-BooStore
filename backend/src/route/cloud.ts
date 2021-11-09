import * as express from 'express';
import { upload, canIncreaseCurrentCapacity }  from '../service/cloud';
import * as multer from 'multer';


const router = express.Router();

router.post('/upload',async(req,res)=>{

	const files = req.files as  Express.Multer.File[] ;

	files.forEach( async( file )=>{
		let fileCheck : Boolean = await canIncreaseCurrentCapacity(req.user, file.size);

		if(!fileCheck){
			res.status(409)
		 } 
	})
	res.send("upload success????");
})

export default router;