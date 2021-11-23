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

interface Directory {
	directory: string;
	name: string;
}

export const getFiles = async ({ loginId, regex, isAscending, isDeleted }: FilesArg) => {
	const files = await Cloud.find(
		{
			directory: { $regex: regex },
			ownerId: loginId,
			isDeleted,
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
	const filteredFiles = [];
	const filteredFolders = [];
	originFiles.map((file) => {
		if (file.directory === path) {
			if (file.contentType === 'folder') {
				filteredFolders.push(file);
			} else {
				filteredFiles.push(file);
			}
		}
	});
	return filteredFolders.concat(filteredFiles);
};

export const getDirectoryList = async (loginId: string) => {
	const allFiles = await Cloud.find(
		{
			ownerId: loginId,
			contentType: "folder"
		},
		{
			_id: false,
			directory: true,
			name: true
		}
	);

	const directoryArr = makeDirectoryToArrFormat(allFiles);
	return directoryArr;
};

const makeDirectoryToArrFormat = (allFiles: Directory[]) => {
	const directorySet = new Set();
	allFiles
		.forEach((file) => {
			if(file.directory=='/'){
				directorySet.add(file.directory+file.name);
			}
			else{
				directorySet.add(file.directory+'/'+file.name);
			}
		});
	return Array.from(directorySet);
};
