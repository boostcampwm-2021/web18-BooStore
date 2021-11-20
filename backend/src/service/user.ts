import * as bcrypt from 'bcrypt';
import { User } from '../model';

const MAX_CAPACITY = Number(process.env.MAX_CAPACITY); 

export const createUser = async ({ loginId, password }) => {
	const existsUser = await User.findOne({ loginId }).exec();
	
	if (existsUser) {
		throw new Error('loginId already exists');
	}
	
	const salt = bcrypt.genSaltSync(10);
	const encryptPassword = bcrypt.hashSync(password, salt);
	const newUser = await User.create({
		loginId,
		password: encryptPassword,
		maxCapacity: MAX_CAPACITY,
	});
	
	return newUser;
}

export const isExistsUser = async ({ loginId }) => {
	const existsUser = await User.findOne({ loginId }).exec();
	
	return existsUser !== null;
}