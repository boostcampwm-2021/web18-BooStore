import * as express from 'express';
import * as passport from 'passport';
import { createUser, isExistsUser } from '../service/user';
import create_bucket from '../model/object-storage';

const router = express.Router();

const validateId = (id) => {
	const regex = /^[a-zA-Z0-9]{4,13}$/;
	return regex.test(id);
}
const validatePassword = (password) => {
	const regex = /^[a-zA-Z0-9!@#$%^&*]{4,13}$/;
	return regex.test(password);
}

router.post('/signup', async (req, res) => {
	const { id, password } = req.body;
	
	if (!(validateId(id) && validatePassword(password))) {
		return res.status(400).send();
	}
	if (await isExistsUser({ loginId: id })) {
		return res.status(409).send();
	}
	
	try {
		const user = await createUser({loginId: id, password});
		
		return res.status(200).send();
	}
	catch(err) {
		return res.status(500).send(err);
	}
});

router.post('/login', passport.authenticate('local-login'), (req, res) => {
	res.json(req.user);
});

router.post('/logout', (req, res) => {
	req.logout();
	req.session.save(() => {
		res.status(200).send();
	});
})

router.get('/upload',async(req,res)=>{
	await create_bucket();
	res.send("create success????");
})

export default router;
