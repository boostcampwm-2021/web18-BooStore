import { FileDTO } from "../DTO";

export const getFiles = (directory: string) => {
	return fetch('/user/files?path=' + directory, {
		credentials: 'include',
	})
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			// console.log(data);
			const files : FileDTO[] = data; 
			return files;
		});
};

