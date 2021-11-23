import { FileDTO } from '../DTO';


export const getTrashFiles = () => {
	return fetch(`/cloud/trash`, {
		credentials: 'include',
		
	})
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			const files: FileDTO[] = data;
			console.log(files);
			return files;
		})
		.catch((err) => {
			console.error(err);
			return [];
		});
};
