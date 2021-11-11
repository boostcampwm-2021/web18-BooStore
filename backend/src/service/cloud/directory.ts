import { Cloud } from '../../model';

export interface PathArg {
	loginId: string;
	path: string;
	regex: string;
}

export const getFiles = async ({ loginId, path, regex }: PathArg) => {
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
		}
	).exec();
	return files;
};
