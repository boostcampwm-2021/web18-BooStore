export const applyEscapeString = (str: string) => {
	let result = '';
	for (const char of str) {
		switch (char) {
			case '(':
			case ')':
			case '{':
			case '}':
			case '$':
			case '^':
			case '*':
			case '+':
			case '[':
			case ']':
			case '|':
				result += `\\${char}`;
				break;
			default:
				result += char;
		}
	}
	return result;
};
