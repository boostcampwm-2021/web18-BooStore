export const getDirectoryList = async() => {
    return fetch('/user/directory',{
		credentials: 'include',
	})
	.then((res) => {
		return res.json();
	})
} 