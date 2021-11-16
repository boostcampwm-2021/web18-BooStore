import { FileDTO } from '../DTO';

export const getFiles = (directory: string, isAscending: boolean) => {
	return fetch('/user/files?path=' + directory + '&isAscending=' + isAscending, {
		credentials: 'include',
	})
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			const files: FileDTO[] = data;
			return files;
		});
};
