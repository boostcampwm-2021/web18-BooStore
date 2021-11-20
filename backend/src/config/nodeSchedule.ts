import { scheduleJob } from 'node-schedule';
import { Cloud } from '../model';
import { removeFiles } from '../service/cloud';

/**
 *	cron: '* * * * *'
 *	durationDay: 7  (unit: day)
 **/
export const clearTrashFileScheduler = (cron: string, durationDay = 7) => {
	if (typeof cron === 'undefined') {
		throw new Error('부적절한 인자');
	}

	return scheduleJob(cron, async () => {
		const baseDate = new Date();
		baseDate.setDate(baseDate.getDate() - durationDay);

		const files = await Cloud.find(
			{
				isDeleted: true,
				deletedAt: {
					$lte: baseDate,
				},
			},
			{
				ownerId: true,
			}
		).exec();
		const filesSeperatedUser = files.reduce((prev, file) => {
			const { ownerId, _id } = file;
			if (prev.hasOwnProperty(ownerId)) {
				return prev[ownerId].push(_id);
			}
			prev[ownerId] = [_id];
			return prev;
		}, {});

		Object.keys(filesSeperatedUser).forEach((ownerId) => {
			removeFiles({
				targetIds: filesSeperatedUser[ownerId],
				userLoginId: ownerId,
			});
		});
	});
};
