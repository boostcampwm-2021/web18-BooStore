const assert = require('assert');
const { applyEscapeString } = require('../../src/util/regex');

describe('applyEscapeString', () => {
	describe('Escape할 필요 없는 문자열이면 같은 값이 나와야 한다.', () => {
		it('input: "test", output: "test"', () => {
			// given
			const input = 'test';
			const expected = input;

			// when
			const result = applyEscapeString(input);

			// then
			assert.equal(result, expected);
		});
		it('input: "BooStore", output: "BooStore"', () => {
			// given
			const input = 'BooStore';
			const expected = input;

			// when
			const result = applyEscapeString(input);

			// then
			assert.equal(result, expected);
		});
	});
	describe('Escape가 필요한 문자는 Escape처리를 해준다.', () => {
		it('input: "file(1)", output: "file\\(1\\)"', () => {
			// given
			const input = 'file(1)';
			const expected = 'file\\(1\\)';

			// when
			const result = applyEscapeString(input);

			// then
			assert.equal(result, expected);
		});
		it('input: "(){}$^*+[]|", output: "\\(\\)\\{\\}\\$\\^\\*\\+\\[\\]\\|"', () => {
			// given
			const input = '(){}$^*+[]|';
			const expected = '\\(\\)\\{\\}\\$\\^\\*\\+\\[\\]\\|';

			// when
			const result = applyEscapeString(input);

			// then
			assert.equal(result, expected);
		});
	});
});
