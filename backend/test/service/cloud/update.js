const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const { createUser } = require('../../../src/service');
const { updateDir } = require('../../../src/service/cloud');
const { Cloud, User } = require('../../../src/model');

const loginId = 'testCodeUser@';
const initCloudDocs = async () => {
	/*
	- /file2.txt
	- /folder1
	- /folder1/folder2
	- /folder1/file1.txt
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
		},
		{
			ownerId: loginId,
			directory: '/folder1',
			name: 'file1.txt',
			contentType: 'text/plain',
		},
		{
			ownerId: loginId,
			directory: '/',
			name: 'file2.txt',
			contentType: 'text/plain',
		}
	);
};

describe('service/cloud/update.ts', function () {
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

	describe('updateDir', function () {
		beforeEach('make documents', initCloudDocs);
		afterEach('delete documents', async () => {
			await Cloud.deleteMany({});
		});

		it('루트에 있는 파일(file2.txt)을 /folder1/folder2 디렉토리로 이동', async () => {
			// given
			const file = await Cloud.findOne({ directory: '/', name: 'file2.txt' });
			const input = [loginId, [file._id], '/folder1/folder2', '/'];
			const expected = '/folder1/folder2';

			// when
			await updateDir(...input);
			const result = await Cloud.findById(file._id);

			// then
			assert.equal(result.directory, expected);
		});
		
		it('/folder1에 있는 파일(file1.txt)을 /folder1/folder2 디렉토리로 이동', async () => {
			// given
			const file = await Cloud.findOne({ directory: '/folder1', name: 'file1.txt' });
			const input = [loginId, [file._id], '/folder1/folder2', '/folder1'];
			const expected = '/folder1/folder2';

			// when
			await updateDir(...input);
			const result = await Cloud.findById(file._id);

			// then
			assert.equal(result.directory, expected);
		});
		it('/folder1에 있는 파일(file1.txt)을 루트 디렉토리로 이동', async () => {
			// given
			const file = await Cloud.findOne({ directory: '/folder1', name: 'file1.txt' });
			const input = [loginId, [file._id], '/', '/folder1'];
			const expected = '/';

			// when
			await updateDir(...input);
			const result = await Cloud.findById(file._id);

			// then
			assert.equal(result.directory, expected);
		});
	});
});
