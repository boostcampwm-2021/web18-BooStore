import { FileDTO,  FileEditAction } from '../DTO';
import { handleFiles } from 'api';


export const getTrashFiles = () => {
	return fetch(`/cloud/trash`, {
		credentials: 'include',
		
	})
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			const files: FileDTO[] = data;
			return files;
		})
		.catch((err) => {
			console.error(err);
			return [];
		});
};

export const moveFileToTrash = async (selectedFiles: Map<string, FileDTO>) => {
	const targetIds = [...selectedFiles.values()]
		.filter((file) => file.contentType !== 'folder')
		.map((file) => file._id);
	const directories = [...selectedFiles.values()]
		.filter((file) => file.contentType === 'folder')
		.map((file) => ({
			directory: file.directory,
			name: file.name,
		}));

	const body = {
		targetIds: targetIds,
		directories: directories,
		action: FileEditAction.trash,
	};

	handleFiles('PATCH',body);
};

export const restoreTrashFile = async (selectedFiles: Map<string, FileDTO>) => {
	const targetIds = [...selectedFiles.values()]
		.filter((file) => file.contentType !== 'folder')
		.map((file) => file._id);
	const directories = [...selectedFiles.values()]
		.filter((file) => file.contentType === 'folder')
		.map((file) => ({
			directory: file.directory,
			name: file.name,
		}));

	const body = {
		targetIds: targetIds,
		directories: directories,
		action: FileEditAction.restore,
	};

	handleFiles('PATCH',body);
};

export const removeFile = async (selectedFiles: Map<string, FileDTO>) => {
	const targetIds = [...selectedFiles.values()]
		.filter((file) => file.contentType !== 'folder')
		.map((file) => file._id);
	const directories = [...selectedFiles.values()]
		.filter((file) => file.contentType === 'folder')
		.map((file) => ({
			directory: file.directory,
			name: file.name,
		}));

	const body = {
		targetIds: targetIds,
		directories: directories,
	};
	//handleFiles('DELETE',body)
	await fetch('/cloud/files', {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
};
