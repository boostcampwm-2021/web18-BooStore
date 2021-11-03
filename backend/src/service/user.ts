import * as bcrypt from 'bcrypt';

// Mock Data
const User = {
	findOne: ({ loginId }) => {
		return {
			exec: async () => {
				return {
					id: '1234',
					loginId,
					password: '$2b$10$HXWgJY9wgh11rh6z4PFZn.I7bfoCZgP0.hG5/Y2pUabZitwY7z6x2',
					directoryId: '123123',
					maxCapacity: 1024 * 1024 * 1024,
					currentCapacity: 1024 * 1024,
				};
			},
		};
	},
	create: async ({ loginId, password, maxCapacity, cloudId }) => {
		return {
			id: '1234',
			loginId: loginId,
			password: password,
			cloudId: cloudId,
			maxCapacity: maxCapacity,
			currentCapacity: 0,
		};;
	},
};
// Mock Data
const CloudService = {
	create: async ({ osLink, name, size, ownerId, contentType}) => {
		return {
			id: '123123',
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
			id: '123123',
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
const MAX_CAPACITY = 1024 * 1024 * 1024; // 나중에 설정파일로 빼고싶다.

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
		cloudId: cloudRoot.id
	});
	
	return newUser;
}

export const isExistsUser = async ({ loginId }) => {
	const existsUser = await User.findOne({ loginId }).exec();
	
	return existsUser ? true : false;
}