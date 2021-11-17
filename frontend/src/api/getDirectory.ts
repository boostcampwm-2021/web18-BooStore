export const getDirectoryList = async() => {
    return fetch('/user/directory',{
		credentials: 'include',
	})
} 