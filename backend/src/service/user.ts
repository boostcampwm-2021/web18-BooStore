import * as bcrypt from 'bcrypt';
import { User } from '../model';

// Mock Data
const CloudService = {
	create: async ({ osLink, name, size, ownerId, contentType}) => {
		return {
			id: Math.floor(Math.random() * 1000000000).toString(),
			children: [],
			osLink: osLink,
			name: name,
			size: size,
			ownerId: ownerId,
			contentType: contentType,
			createdAt: new Date(),
			updatedAt: new Date()
		}
	},
	createRoot: async ({ loginId }) => {
		return {
			id: Math.floor(Math.random() * 1000000000).toString(),
			children: [],
			osLink: null,
			name: 'root',
			size: 0,
			ownerId: loginId,
			contentType: 'directory',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	}
}
const MAX_CAPACITY = Number(process.env.MAX_CAPACITY); 

export const createUser = async ({ loginId, password }) => {
	const existsUser = await User.findOne({ loginId }).exec();
	
	if (existsUser) {
		throw new Error('loginId already exists');
	}
	
	const cloudRoot = await CloudService.createRoot({ loginId });
	
	const salt = bcrypt.genSaltSync(10);
	const encryptPassword = bcrypt.hashSync(password, salt);
	const newUser = await User.create({
		loginId,
		password: encryptPassword,
		maxCapacity: MAX_CAPACITY,
		directoryId: cloudRoot.id
	});
	
	return newUser;
}

export const isExistsUser = async ({ loginId }) => {
	const existsUser = await User.findOne({ loginId }).exec();
	
	return existsUser !== null;
}