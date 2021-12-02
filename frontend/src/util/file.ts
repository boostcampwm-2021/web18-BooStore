import { FileDTO } from '../DTO';

export const getFiles = (
	directory: string,
	isAscending: boolean,
	isDeleted: boolean = false,
	isStar: boolean = false
) => {
	return fetch(
		`/cloud/files?path=${directory}&isAscending=${isAscending}&isDeleted=${isDeleted}&isStar=${isStar}`,
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
	return fetch(`/cloud/starfiles?path=${directory}&isAscending=${isAscending}`, {
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

export const getNotOverlappedName = async (
	currentDirectory: string,
	folderName: string,
	files: FileDTO[] = [],
	trashFiles: FileDTO[] = []
): Promise<string> => {
	if (files.length === 0) {
		files = await getFiles(currentDirectory, true, false);
	}
	if (trashFiles.length === 0) {
		trashFiles = await getFiles(currentDirectory, true, true);
	}
	let file = files.find((file) => file.name === folderName);
	if (file === undefined) {
		file = trashFiles.find((file) => file.name === folderName);
		if (file === undefined) {
			return folderName;
		}
	}

	const leftBracketIndex = folderName.lastIndexOf('(');
	const rightBracketIndex = folderName.lastIndexOf(')');
	if (
		leftBracketIndex === -1 ||
		rightBracketIndex === -1 ||
		rightBracketIndex !== folderName.length - 1 ||
		leftBracketIndex + 1 >= rightBracketIndex
	) {
		return getNotOverlappedName(currentDirectory, `${folderName}(1)`, files, trashFiles);
	}

	const strInsideBracket = folderName.slice(leftBracketIndex + 1, rightBracketIndex);
	const overlapNumber = Number(strInsideBracket);
	if (isNaN(overlapNumber)) {
		return getNotOverlappedName(currentDirectory, `${folderName}(1)`, files, trashFiles);
	}

	const newFilename = `${folderName.slice(0, leftBracketIndex)}(${overlapNumber + 1})`;
	return getNotOverlappedName(currentDirectory, newFilename, files, trashFiles);
};

export const getNotOverlappedRelativePaths = async (
	selectedUploadFiles: File[],
	currentDir: string
) => {
	const relativePaths: Map<string, string> = new Map();
	if (selectedUploadFiles[0].webkitRelativePath != '') {
		const relativePath = selectedUploadFiles[0].webkitRelativePath;
		const createdFolderName = relativePath.split('/')[0];
		const notOverlappedName = await getNotOverlappedName(currentDir, createdFolderName);

		if (createdFolderName === notOverlappedName) {
			selectedUploadFiles.forEach((file) => {
				const { webkitRelativePath: wRP, name } = file;

				relativePaths.set(name, wRP);
			});
		} else {
			selectedUploadFiles.forEach((file) => {
				const { webkitRelativePath: wRP, name } = file;

				relativePaths.set(
					name,
					`${notOverlappedName}/${wRP.split('/').slice(1).join('/')}`
				);
			});
		}
	} else {
		selectedUploadFiles.forEach((file) => {
			const { webkitRelativePath: wRP, name } = file;

			relativePaths.set(name, wRP);
		});
	}

	return relativePaths;
};
