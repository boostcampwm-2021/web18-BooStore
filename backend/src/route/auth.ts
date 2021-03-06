import * as express from 'express';
import * as passport from 'passport';
import { createUser, isExistsUser } from '../service';
import { ResponseUser } from '../DTO';

const router = express.Router();

const validateId = (id) => {
	const regex = /^[a-zA-Z0-9]{4,13}$/;
	return regex.test(id);
};
const validatePassword = (password) => {
	const regex = /^[a-zA-Z0-9!@#$%^&*]{4,13}$/;
	return regex.test(password);
};

router.post('/signup', async (req, res) => {
	const { id, password } = req.body;

	if (!(validateId(id) && validatePassword(password))) {
		return res.status(400).send();
	}
	if (await isExistsUser({ loginId: id })) {
		return res.status(409).send();
	}

	try {
		await createUser({ loginId: id, password });

		return res.status(200).send();
	} catch (err) {
		return res.status(500).send(err);
	}
});

router.post('/login', passport.authenticate('local-login'), (req, res) => {
	const { loginId } = req.user;
	const data: ResponseUser = { loginId };

	res.json(data);
});

router.post('/logout', (req, res) => {
	req.logout();
	req.session.save(() => {
		res.status(200).send();
	});
});

export default router;
