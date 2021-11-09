import * as express from 'express';

export const isAuthenticated = (req: express.Request, res: express.Response, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	
	return res.status(401).send();
}
