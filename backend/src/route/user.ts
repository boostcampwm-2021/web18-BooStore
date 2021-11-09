import * as express from 'express';
import { ResponseUser } from '../DTO';
import { getCapacity } from '../service/cloud';

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

router.get('/capacity', async (req, res) => {
	if (req.isUnauthenticated()) {
		return res.status(401).send();
	}

	/*
	// 세션을 사용하는게 좋을까? 아니면 디비에 다시 접근하는게 좋을까...
	// 고민해보자
	const { maxCapacity, currentCapacity } = req.user;
	const data = {
		currentCapacity,
		maxCapacity,
	};
	*/
	
	const { loginId } = req.user;
	const data = await getCapacity({ loginId });
	
	return res.json(data);
});

export default router;
