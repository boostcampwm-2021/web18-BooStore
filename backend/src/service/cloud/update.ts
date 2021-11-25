import { Cloud } from '../../model';
import { applyEscapeString } from '../../util';
import { getNotOverlappedName } from '.';

export const updateDir = async (
	loginId: string,
	targetIds: string[],
	newDir: string,
	curDirectory: string
) => {
	// targetId에 해당하는 모든 Document를 가져온다.
	const docs = await Cloud.find({ _id: { $in: targetIds }, ownerId: loginId }).exec();

	// 타겟 폴더에 중복된 이름이 있는 것을 검사하여, 중복되지 않는 이름을 가져온다.
	const targetNames = new Map<string, string>();
	await Promise.all(
		docs.map(async (doc) => {
			const notOverlappedFilename = await getNotOverlappedName(newDir, doc.name, loginId);
			targetNames.set(doc._id, notOverlappedFilename);
			return;
		})
	);

	// 선택된 폴더의 하위디렉토리를 포함하여 모든 파일들을 가져온다.
	const tempResult = await Promise.all(
		docs.map(async (doc) => {
			if (doc.contentType === 'folder') {
				const { directory, name } = doc;
				const targetDir = `${directory}/${name}`
					.replace(/\/\//g, '/')
					.replace(/\//g, '\\/');

				const filesInFolder = await Cloud.find({
					directory: { $regex: `^${applyEscapeString(targetDir)}(\\/.*)?$` },
				}).exec();

				return [...filesInFolder, doc];
			} else {
				return [doc];
			}
		})
	);
	const allFiles = tempResult.flatMap((ele) => ele);

	// 실제로 파일을 이동하는 로직
	await [...targetNames.entries()].map(async ([id, targetName]) => {
		const doc = docs.find((file) => file._id == id);
		if (doc.contentType !== 'folder') {
			return await Cloud.updateOne(
				{ _id: doc._id },
				{
					directory: newDir,
					name: targetName,
				}
			);
		}

		const sourceDir = `${doc.directory}/${doc.name}`
			.replace(/\/\//g, '/')
			.replace(/\//g, '\\/');
		const regex = new RegExp(`^${applyEscapeString(sourceDir)}(\\/.*)?$`);
		const sourceFiles = allFiles.filter((file) => {
			const { directory } = file;

			return regex.test(directory);
		});

		await Promise.all(
			sourceFiles.map(async (file) => {
				const changedDir = file.directory
					.replace(curDirectory, '/')
					.replace('//', '/')
					.replace(`/${doc.name}`, `/${targetName}`);
				const targetDirectory = `${newDir}${changedDir}`;

				return await Cloud.updateOne(
					{
						_id: file._id,
					},
					{
						directory: targetDirectory,
					}
				);
			})
		);
		return await Cloud.updateOne({ _id: id }, { name: targetName, directory: newDir });
	});
};
