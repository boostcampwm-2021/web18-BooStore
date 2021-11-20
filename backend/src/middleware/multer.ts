import * as multer from 'multer';
import * as path from 'path';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (!req.user) {
			// 매끄럽게 처리할 방법이 없을까?
			return cb(new Error('401'), '');
		}
		cb(null, path.join(path.resolve(), 'temp/'));
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}${req.user.loginId}-${file.originalname}`);
	},
});

export const upload = multer({ storage });
