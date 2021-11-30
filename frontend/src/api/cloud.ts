export const handleFiles = async (method: string, body: object) => {
	return await fetch('/cloud/files', {
		method: method,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
};
