import { Cloud, ICloud } from '../../model';

export interface FilesArg {
	loginId: string;
	path: string;
	regex: string;
	isAscending: boolean;
}

export interface FilteredFilesArg {
	path: string;
	originFiles: ICloud[];
}

export const getFiles = async ({ loginId, path, regex, isAscending }: FilesArg) => {
	const files = Cloud.find(
		{
			directory: { $regex: regex },
			ownerId: loginId,
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
			const tempFile: ICloud = JSON.parse(JSON.stringify(file));
			tempFile.createdAt = file.createdAt;
			tempFile.updatedAt = file.updatedAt;
			filteredFiles.push(tempFile);
		} else {
			const splittedDirectory = file.directory.split('/');
			if (directories.indexOf(splittedDirectory[splittedPath.length]) === -1) {
				directories.push(splittedDirectory[splittedPath.length]);
				const tempFile: ICloud = JSON.parse(JSON.stringify(file));
				tempFile.contentType = 'folder';
				tempFile.size = 0;
				tempFile.name = splittedDirectory[splittedPath.length];
				tempFile.createdAt = file.createdAt;
				tempFile.updatedAt = file.updatedAt;

				filteredFolders.push(tempFile);
			}
		}
	});
	return filteredFolders.concat(filteredFiles);
};

const getFormattedDate = (date: string) => {
	return new Date(Date.parse(date))
		.toLocaleString()
		.replace('.', '년')
		.replace('.', '월')
		.replace('.', '일');
};
