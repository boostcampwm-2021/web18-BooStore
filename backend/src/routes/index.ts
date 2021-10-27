import * as express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
	res.send('init');
});

export default router;
