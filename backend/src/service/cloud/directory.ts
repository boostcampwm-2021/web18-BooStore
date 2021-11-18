import { Cloud, ICloud } from '../../model';

export interface FilesArg {
	loginId: string;
	regex: string;
	isAscending: boolean;
	isDeleted: boolean;
}

export interface FilteredFilesArg {
	path: string;
	originFiles: ICloud[];
}

export const getFiles = async ({ loginId, regex, isAscending, isDeleted }: FilesArg) => {
	const files = Cloud.find(
		{
			directory: { $regex: regex },
			ownerId: loginId,
			isDeleted
		},
		{
			directory: true,
			name: true,
			contentType: true,
			createdAt: true,
			updatedAt: true,
			size: true,
			ownerId: true,
		},
		{ sort: { name: isAscending ? 'asc' : 'desc' } }
	).exec();
	return files;
};

export const getFilteredFiles = ({ path, originFiles }: FilteredFilesArg) => {
	const directories = [];
	const splittedPath = path === '/' ? [''] : (path as string).split('/');
	const filteredFiles = [];
	const filteredFolders = [];
	originFiles.map((file) => {
		if (file.directory === path) {
			filteredFiles.push(file);
		} else {
			const splittedDirectory = file.directory.split('/');
			if (directories.indexOf(splittedDirectory[splittedPath.length]) === -1) {
				directories.push(splittedDirectory[splittedPath.length]);
				file.contentType = 'folder';
				file.size = 0;
				file.name = splittedDirectory[splittedPath.length];
				file.directory = path;
				filteredFolders.push(file);
			}
		}
	});
	return filteredFolders.concat(filteredFiles);
};
