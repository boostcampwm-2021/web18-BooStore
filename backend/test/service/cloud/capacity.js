const assert = require('assert');
require('dotenv').config();
const mongoose = require('mongoose');
const {
	getCapacity,
	canIncreaseCurrentCapacity,
	canDecreaseCurrentCapacity,
	increaseCurrentCapacity,
	decreaseCurrentCapacity,
	updateMaxCapacity,
} = require('../../../src/service/cloud');
const { createUser } = require('../../../src/service');
const { User } = require('../../../src/model');

describe('capacity.ts', function () {
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

	describe('getCapacity', function () {
		beforeEach('reset User Capacity', async () => {
			await User.updateOne(
				{
					loginId,
				},
				{
					currentCapacity: 0,
					maxCapacity: 1000,
				}
			);
		});

		it('Document가 가진 용량 정보와 동일해야 함', async () => {
			// given
			const input = { loginId };
			const expected = {
				currentCapacity: 0,
				maxCapacity: 1000,
			};

			// when
			const result = await getCapacity(input);

			// then
			assert.deepEqual(result, expected);
		});
	});
});
