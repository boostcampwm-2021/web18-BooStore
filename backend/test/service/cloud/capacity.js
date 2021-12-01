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
	describe('canIncreaseCurrentCapacity', function () {
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

		it('Document의 현재 용량 + value가 최대 용량보다 작으면 true', async () => {
			// given
			const input = { loginId, value: 100 };
			const expected = true;

			// when
			const result = await canIncreaseCurrentCapacity(input);

			// then
			assert.equal(result, expected);
		});
		it('Document의 현재 용량 + value가 최대 용량과 같으면 true', async () => {
			// given
			const input = { loginId, value: 1000 };
			const expected = true;

			// when
			const result = await canIncreaseCurrentCapacity(input);

			// then
			assert.equal(result, expected);
		});

		it('Document의 현재 용량 + value가 최대 용량보다 크면 false', async () => {
			// given
			const input = { loginId, value: 10000 };
			const expected = false;

			// when
			const result = await canIncreaseCurrentCapacity(input);

			// then
			assert.equal(result, expected);
		});
	});
	describe('canDecreaseCurrentCapacity', function () {
		beforeEach('reset User Capacity', async () => {
			await User.updateOne(
				{
					loginId,
				},
				{
					currentCapacity: 100,
					maxCapacity: 1000,
				}
			);
		});

		it('Document의 현재 용량 - value가 0보다 크면 true', async () => {
			// given
			const input = { loginId, value: 50 };
			const expected = true;

			// when
			const result = await canDecreaseCurrentCapacity(input);

			// then
			assert.equal(result, expected);
		});
		it('Document의 현재 용량 - value가 0이면 true', async () => {
			// given
			const input = { loginId, value: 100 };
			const expected = true;

			// when
			const result = await canDecreaseCurrentCapacity(input);

			// then
			assert.equal(result, expected);
		});

		it('Document의 현재 용량 - value가 0보다 작으면 false', async () => {
			// given
			const input = { loginId, value: 10000 };
			const expected = false;

			// when
			const result = await canDecreaseCurrentCapacity(input);

			// then
			assert.equal(result, expected);
		});
	});
	describe('increaseCurrentCapacity', function () {
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

		it('User Document의 currentCapacity의 값이 value만큼 증가됨', async () => {
			// given
			const input = { loginId, value: 50 };
			const expected = 50;

			// when
			await increaseCurrentCapacity(input);
			const user = await User.findOne({ loginId }).exec();
			const result = user.currentCapacity;

			// then
			assert.equal(result, expected);
		});
		it('currentCapacity의 값을 증가시키지 못하는 경우 에러발생', async () => {
			// given
			const input = { loginId, value: 10000 };
			const expected = `Can't increase CurrentCapacity`;

			try {
				// when
				await increaseCurrentCapacity(input);
				assert.fail();
			} catch (err) {
				// then
				assert.equal(err.message, expected);
			}
		});
	});
	describe('decreaseCurrentCapacity', function () {
		beforeEach('reset User Capacity', async () => {
			await User.updateOne(
				{
					loginId,
				},
				{
					currentCapacity: 100,
					maxCapacity: 1000,
				}
			);
		});

		it('User Document의 currentCapacity의 값이 value만큼 감소됨', async () => {
			// given
			const input = { loginId, value: 50 };
			const expected = 50;

			// when
			await decreaseCurrentCapacity(input);
			const user = await User.findOne({ loginId }).exec();
			const result = user.currentCapacity;

			// then
			assert.equal(result, expected);
		});
		it('currentCapacity의 값을 감소시키지 못하는 경우 에러발생', async () => {
			// given
			const input = { loginId, value: 10000 };
			const expected = `Can't decrease CurrentCapacity`;

			try {
				// when
				await decreaseCurrentCapacity(input);
				assert.fail();
			} catch (err) {
				// then
				assert.equal(err.message, expected);
			}
		});
	});
});
