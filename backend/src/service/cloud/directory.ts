import { Cloud } from '../../model';

export interface PathArg {
	loginId: string;
	path: string;
}

export const getFileTree = async ({ loginId, path }: PathArg) => {
	// ${path} 디렉토리의 파일들과 ${path}가 포함한 파일들
	const files = Cloud.find(
		{ directory: { $regex: `(^${path}$)|(^${path}\/([^/])+)$` }, ownerId: loginId },
		{
			directory: true,
			name: true,
			contentType: true,
			createdAt: true,
			updatedAt: true,
			size: true,
			ownerId: true,
		}
	).exec();
	return files;
};
