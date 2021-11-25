
export function throttle(fn: Function, limit = 100) {
	let timer = false;
	return function (...args: any[]) {
		if (!timer) {
			timer = true;
			fn.apply(undefined, arguments);
			setTimeout(() => {
				timer = false;
			}, limit);
		}
	};
}