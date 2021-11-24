import { FileDTO } from '../DTO';

export const getFiles = (
	directory: string,
	isAscending: boolean,
	isDeleted: boolean = false,
	isStar: boolean = false
) => {
	return fetch(
		`/user/files?path=${directory}&isAscending=${isAscending}&isDeleted=${isDeleted}&isStar=${isStar}`,
		{
			credentials: 'include',
		}
	)
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			const files: FileDTO[] = data;
			return files;
		});
};

export const getAllStarFiles = (directory: string, isAscending: boolean) => {
	return fetch(`/user/starfiles?path=${directory}&isAscending=${isAscending}`, {
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
