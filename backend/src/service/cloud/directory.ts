import { Cloud } from '../../model';

interface Directory {
	directory: string;
	name: string;
}

export const getDirectoryList = async (loginId: string) => {
	const allFiles = await Cloud.find(
		{
			ownerId: loginId,
			contentType: 'folder',
			isDeleted: false,
		},
		{
			_id: false,
			directory: true,
			name: true,
		}
	);

	const directoryArr = makeDirectoryToArrFormat(allFiles);
	return directoryArr;
};

const makeDirectoryToArrFormat = (allFiles: Directory[]) => {
	const directorySet = new Set();
	allFiles.forEach((file) => {
		if (file.directory == '/') {
			directorySet.add(file.directory + file.name);
		} else {
			directorySet.add(file.directory + '/' + file.name);
		}
	});
	return Array.from(directorySet);
};
