const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const { createUser } = require('../../../src/service');
const { getTrashFiles } = require('../../../src/service/cloud');
const { Cloud, User } = require('../../../src/model');

describe('service/cloud/trash.ts', function () {
	const loginId = 'testCodeUser@';

	before('connect', function (done) {
		mongoose.connect(
			'mongodb://localhost:27017/BooStore',
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
			done
		);
	});
	after('close', function () {
		mongoose.connection.close();
	});
	beforeEach('make User', async () => {
		await createUser({ loginId, password: 'test' });
	});
	afterEach('delete User', async () => {
		await User.deleteOne({ loginId });
	});

	describe('getTrashFiles', function () {
		beforeEach('make documents', async () => {
			/*
			- /folder1
			- /folder1/folder2     <- 삭제됨
			- /folder1/file1.txt   <- 삭제됨
			*/
			await Cloud.create(
				{
					ownerId: loginId,
					directory: '/',
					name: 'folder1',
					contentType: 'folder',
				},
				{
					ownerId: loginId,
					directory: '/folder1',
					name: 'folder2',
					contentType: 'folder',
					isDeleted: true,
				},
				{
					ownerId: loginId,
					directory: '/folder1',
					name: 'file1.txt',
					contentType: 'text/plain',
					isDeleted: true,
				}
			);
		});
		afterEach('delete documents', async () => {
			await Cloud.deleteMany({});
		});

		it('휴지통에 있는 document들은 총 2개, result == 2', async () => {
			// given
			const input = loginId;
			const expected = 2;

			// when
			const directories = await getTrashFiles(input);

			// then
			assert.equal(directories.length, expected);
		});

		it('삭제된 폴더안 파일들은 포함되면 안됨', async () => {
			// given
			/*
			- /folder1			   <- 삭제됨
			- /folder1/folder2     <- 삭제됨
			- /folder1/file1.txt   <- 삭제됨
			*/
			await Cloud.updateOne(
				{
					directory: '/',
					name: 'folder1',
				},
				{
					$set: { isDeleted: true },
				}
			);
			const input = loginId;
			const expected = 1;

			// when
			const directories = await getTrashFiles(input);

			// then
			assert.equal(directories.length, expected);
		});
	});
});
