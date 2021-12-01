function checkCookie(req, res, userContext, events, next) {
	if (!res.headers['set-cookie']) {
		console.log(`No cookie set for ${req}`);
	}
	console.log(userContext);
	return next();
}

function printResult(req, res, userContext, events, next) {
	console.log(res.body);
	return next();
}

module.exports = {
	checkCookie,
	printResult,
};
