
export const getCapacity = async () => {
	return fetch('/user/capacity', {
		credentials: 'include',
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error('something wrong');
			}
		})
		.then((data) => data)
		.catch((err) => {
			console.error(err);
		});
};