import * as express from 'express';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as dotenv from 'dotenv';
dotenv.config();
import * as passport from 'passport';
import passportConfig from './config/passport';
import * as session from 'express-session';
import * as fs from 'fs';
import { clearTrashFileScheduler } from './config/nodeSchedule';

import { authRouter, userRouter, cloudRouter } from './route';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), '../frontend/build')));

app.use(session({ secret: 'secret123123', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
passportConfig();

// 1시간마다 체크하여, 7일이상 지난 쓰레기통의 파일을 제거함
clearTrashFileScheduler('0 * * * *', 7);

fs.mkdir(path.join(path.resolve(), 'temp/'), ()=>{});

app.use('/', authRouter);
app.use('/user', userRouter);
app.use('/cloud', cloudRouter);
app.use('*', (req, res) => {
	res.sendFile('index.html', {
		root: path.join(__dirname, '../../frontend/build')
	});
});

module.exports = app;
