import * as express from 'express';
import { ResponseUser } from '../DTO';
import { getCapacity, getDirectoryList } from '../service/cloud';
import { isAuthenticated } from '../middleware';

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
	const { loginId } = req.user;

	const data: ResponseUser = { loginId };

	return res.json(data);
});

router.get('/capacity', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const data = await getCapacity({ loginId });

	return res.json(data);
});

router.get('/directory', isAuthenticated, async (req, res) => {
	const { loginId } = req.user;
	const directoryList = await getDirectoryList(loginId);
	return res.json(directoryList);
});

export default router;
