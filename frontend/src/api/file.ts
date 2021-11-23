import { FileDTO, FileEditAction } from '@DTO';

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
	await fetch('/cloud/files', {
		method: 'PUT',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
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
	await fetch('/cloud/files', {
		method: 'PUT',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
};
