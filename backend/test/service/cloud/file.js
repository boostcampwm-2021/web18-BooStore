const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const { createUser } = require('../../../src/service');
const { getNotOverlappedName, createAncestorsFolderDocs } = require('../../../src/service/cloud');
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

describe('service/cloud/file.ts', function () {
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

	describe('getNotOverlappedName', function () {
		beforeEach('make documents', initCloudDocs);
		afterEach('delete documents', async () => {
			await Cloud.deleteMany({});
		});

		it('중복되지 않으면 input == result', async () => {
			// given
			const input = ['/', 'notOverlap', loginId];
			const expected = 'notOverlap';

			// when
			const result = await getNotOverlappedName(...input);

			// then
			assert.equal(result, expected);
		});
		it('중복되면 넘버링 적용. input: file2.txt  output: file2(1).txt', async () => {
			// given
			const input = ['/', 'file2.txt', loginId];
			const expected = 'file2(1).txt';

			// when
			const result = await getNotOverlappedName(...input);

			// then
			assert.equal(result, expected);
		});
		it('중복되면 넘버링 적용. input: file2(1).txt  output: file2(2).txt', async () => {
			// given
			await Cloud.create({
				ownerId: loginId,
				directory: '/',
				name: 'file2(1).txt',
				contentType: 'text/plain',
			});
			const input = ['/', 'file2(1).txt', loginId];
			const expected = 'file2(2).txt';

			// when
			const result = await getNotOverlappedName(...input);

			// then
			assert.equal(result, expected);
		});
		it('중복되면 넘버링 적용. input: folder1  output: folder1(1)', async () => {
			// given
			const input = ['/', 'folder1', loginId];
			const expected = 'folder1(1)';

			// when
			const result = await getNotOverlappedName(...input);

			// then
			assert.equal(result, expected);
		});
	});

});
