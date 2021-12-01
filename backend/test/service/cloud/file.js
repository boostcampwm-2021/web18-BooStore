const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const { createUser } = require('../../../src/service');
const {
	getNotOverlappedName,
	createAncestorsFolderDocs,
	updateStarStatus,
} = require('../../../src/service/cloud');
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

	describe('createAncestorsFolderDocs', function () {
		beforeEach('make documents', initCloudDocs);
		afterEach('delete documents', async () => {
			await Cloud.deleteMany({});
		});

		it('curDirectory의 조상폴더 Document가 없다면 만들어준다.', async () => {
			// given
			const input = ['/nope1/nope2', loginId];
			const expectedLength = 2;
			const expectedFind = true;

			// when
			const result = await createAncestorsFolderDocs(...input);
			const nope1 = await Cloud.findOne({ directory: '/', name: 'nope1' });
			const nope2 = await Cloud.findOne({ directory: '/nope1', name: 'nope2' });

			// then
			assert.equal(result.length, expectedLength);
			assert.equal(!!nope1, expectedFind);
			assert.equal(!!nope2, expectedFind);
		});
	});

	describe('updateStarStatus', function () {
		beforeEach('make documents', initCloudDocs);
		afterEach('delete documents', async () => {
			await Cloud.deleteMany({});
		});

		it('도큐먼트에 스타 추가', async () => {
			// given
			const file = await Cloud.findOne({ name: 'file1.txt' });
			const input = {
				userLoginId: loginId,
				targetIds: [file._id],
				state: true,
			};
			const expected = true;

			// when
			await updateStarStatus(input);
			const result = await Cloud.findById(file._id);

			// then
			assert.equal(result.isStar, expected);
		});
		it('도큐먼트에 스타 제거', async () => {
			// given
			const file = await Cloud.findOneAndUpdate(
				{ name: 'file1.txt' },
				{
					$set: {
						isStar: true,
					},
				}
			);
			const input = {
				userLoginId: loginId,
				targetIds: [file._id],
				state: false,
			};
			const expected = false;

			// when
			await updateStarStatus(input);
			const result = await Cloud.findById(file._id);

			// then
			assert.equal(result.isStar, expected);
		});
	});
});
