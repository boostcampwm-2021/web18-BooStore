export const getDirectoryList = () => {
    return fetch('/user/directory',{
		credentials: 'include',
	})
	.then((res) => {
		return res.json();
	})
} 