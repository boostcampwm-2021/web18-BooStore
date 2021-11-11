import * as express from 'express';
import { ResponseUser } from '../DTO';
import { getCapacity, getFiles, PathArg } from '../service/cloud';
import { isAuthenticated } from '../middleware';

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
	const { loginId, directoryId } = req.user;

	const data: ResponseUser = {
		loginId,
		directoryId,
	};

	return res.json(data);
});

router.get('/capacity', isAuthenticated, async (req, res) => {
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

router.get('/files', isAuthenticated, async (req, res) => {
	const { path } = req.query;
	const { loginId } = req.user;
	if (path === undefined) {
		return res.status(400).send();
	}
	if (path === '') {
		return res.status(400).send();
	}

	const pathArg: PathArg = {
		loginId: loginId,
		path: path as string,
	};

	const tempFiles = await getFiles(pathArg);
	const directories = [];
	const files = [];
	tempFiles.map((file) => {
		if (file.directory === path) {
			files.push(file);
		} else {
			if (directories.indexOf(file.directory) === -1) {
				directories.push(file.directory);
				const directory = file.directory.split('/');
				file.contentType = 'folder';
				file.size = 0;
				file.name = directory[directory.length - 1];
				files.push(file);
			}
		}
	});
	return res.status(200).json(files);
});
export default router;
