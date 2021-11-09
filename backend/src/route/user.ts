import * as express from 'express';
import { ResponseUser } from '../DTO';

const router = express.Router();

router.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		const { loginId, directoryId } = req.user;

		const data: ResponseUser = {
			loginId,
			directoryId
		};

		return res.json(data);
	} else {
		return res.status(401).send();
	}
});

export default router;
