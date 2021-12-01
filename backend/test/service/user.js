const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const { createUser, isExistsUser } = require('../../src/service');
const { User } = require('../../src/model');

describe('user.ts', function () {
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

});
