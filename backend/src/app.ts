import * as express from 'express';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as dotenv from 'dotenv';
import * as passport from 'passport';
import passportConfig from './config/passport';
import * as session from 'express-session';
const MongoStore = require('connect-mongo');
import * as fs from 'fs';
dotenv.config();

import { authRouter, userRouter, cloudRouter } from './route';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), '../frontend/build')));

app.use(session({ 
	secret: 'secret123123', 
	resave: true, 
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: process.env.MONGO_URI
	})
}));
app.use(passport.initialize());
app.use(passport.session());

passportConfig();

fs.mkdir(path.join(path.resolve(), 'temp/'), () => {});

app.use('/', authRouter);
app.use('/user', userRouter);
app.use('/cloud', cloudRouter);
app.use('*', (req, res) => {
	res.sendFile('index.html', {
		root: path.join(__dirname, '../../frontend/build'),
	});
});

module.exports = app;
