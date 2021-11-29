import { Cloud } from '../../model';
import { applyEscapeString } from '../../util';
import { getNotOverlappedName } from '.';

export const updateDir = async (
	loginId: string,
	targetIds: string[],
	newDir: string,
	curDirectory: string
) => {
	const docs = await Cloud.find({ _id: { $in: targetIds }, ownerId: loginId }).exec();

	// 타겟 폴더에 중복된 이름이 있는 것을 검사하여, 중복되지 않는 이름을 가져온다.
	const targetNames = new Map<string, string>();
	await Promise.all(
		docs.map(async ({ name, _id }) => {
			const notOverlappedFilename = await getNotOverlappedName(newDir, name, loginId);
			targetNames.set(_id, notOverlappedFilename);
		})
	);

	// 선택된 폴더의 하위디렉토리를 포함하여 모든 파일들을 가져온다.
	const allFiles = (
		await Promise.all(
			docs.map(async (doc) => {
				if (doc.contentType === 'folder') {
					const { directory, name } = doc;
					const targetDir = `${directory}/${name}`.replace(/\/\/|\//g, '\\/');

					const filesInFolder = await Cloud.find({
						directory: { $regex: `^${applyEscapeString(targetDir)}(\\/.*)?$` },
					}).exec();

					return [...filesInFolder, doc];
				} else {
					return [doc];
				}
			})
		)
	).flat();

	// 실제로 파일을 이동하는 로직
	return await Promise.all(
		[...targetNames.entries()].map(async ([key, targetName]) => {
			const doc = docs.find((file) => file._id == key);
			const { _id, contentType, directory, name } = doc;

			if (contentType !== 'folder') {
				return await Cloud.updateOne(
					{ _id: _id },
					{
						directory: newDir,
						name: targetName,
					}
				);
			}

			const sourceDir = `${directory}/${name}`.replace(/\/\/|\//g, '\\/');
			const regex = new RegExp(`^${applyEscapeString(sourceDir)}(\\/.*)?$`);
			const sourceFiles = allFiles.filter((file) => regex.test(file.directory));

			const updateFilesPromise = Promise.all(
				sourceFiles.map(async (file) => {
					const changedDirName = file.directory
						.replace(curDirectory, '/')
						.replace(/\/\//g, '/')
						.replace(`/${doc.name}`, `/${targetName}`);
					const targetDirectory = `${newDir}${changedDirName}`;

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
			const updateFolderPromise = Cloud.updateOne(
				{ _id: key },
				{ name: targetName, directory: newDir }
			);

			return await Promise.all([updateFolderPromise, updateFilesPromise]);
		})
	);
};
