const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const { createUser } = require('../../../src/service');
const { getDirectoryList } = require('../../../src/service/cloud');
const { Cloud, User } = require('../../../src/model');

describe('service/cloud/directory.ts', function () {
	const loginId = 'testCodeUser@';

	before('connect', function (done) {
		mongoose.connect(
			process.env.TEST_MONGO_URI,
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

	describe('getDirectoryList', function () {
		before('make documents', async () => {
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
				},
				{
					ownerId: loginId,
					directory: '/folder1',
					name: 'file1.txt',
					contentType: 'text/plain',
				}
			);
		});
		after('delete documents', async () => {
			await Cloud.deleteMany({});
		});
		
		it('폴더에 해당하는 document들은 총 2개, result == 2', async () => {
			// given
			const input = loginId;
			const expected = 2;
			
			// when
			const directories = await getDirectoryList(input);
			
			// then
			assert.equal(directories.length, expected);
		})
	});
});
