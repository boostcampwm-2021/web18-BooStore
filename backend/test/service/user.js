const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const { createUser, isExistsUser } = require('../../src/service');
const { User } = require('../../src/model');

describe('service/user.ts', function () {
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

	describe('createUser ', function () {
		it('loginId가 "testCodeUser@"인 경우', async () => {
			const loginId = 'testCodeUser@';
			const password = 'q@!D$DG!ASD';
			const user = await createUser({
				loginId: loginId,
				password: password,
			});

			assert.equal(user.loginId, loginId);
		});
		before('delete Docs', async () => {
			await User.deleteMany({});
		});
		after('delete Docs', async () => {
			await User.deleteMany({});
		});
	});

	describe('isExistsUser', function () {
		const loginId = 'testCodeUser@';
		const password = 'q@!D$DG!ASD';

		before(`loginId가 "${loginId}"인 Docs 제작`, async () => {
			User.deleteMany({});
			await createUser({
				loginId: loginId,
				password: password,
			});
		});

		after(`loginId가 "${loginId}"인 Docs 삭제`, async () => {
			await User.deleteOne({
				loginId: loginId,
			});
		});

		it(`input: { loginId: "존재하는 Docs의 loginId" }, output: true`, async () => {
			// given
			const input = loginId;
			const expected = true;

			// when
			const result = await isExistsUser({ loginId: input });

			// then
			assert.equal(result, expected);
		});

		it(`input: { loginId: "존재하지 않는 임의의 loginId" }, output: true`, async () => {
			// given
			const input = 'nope';
			const expected = false;

			// when
			const result = await isExistsUser({ loginId: input });

			// then
			assert.equal(result, expected);
		});
	});
});
