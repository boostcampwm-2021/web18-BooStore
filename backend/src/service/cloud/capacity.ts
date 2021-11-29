import { User } from '../../model';
import { Capacity } from '../../DTO';

export const getCapacity = async ({ loginId }) => {
	const user = await User.findOne({ loginId }).exec();
	if (!user) {
		throw new Error('Not Found User');
	}

	const { currentCapacity, maxCapacity } = user;
	const data: Capacity = {
		currentCapacity,
		maxCapacity,
	};

	return data;
};

interface CCFunctionParameter {
	loginId: string;
	value: number;
}
export const canIncreaseCurrentCapacity = async ({ loginId, value }: CCFunctionParameter) => {
	const user = await User.findOne({ loginId }).exec();
	if (!user) {
		throw new Error('Not Found User');
	}

	const { maxCapacity, currentCapacity } = user;
	return currentCapacity + value <= maxCapacity;
};

export const canDecreaseCurrentCapacity = async ({ loginId, value }: CCFunctionParameter) => {
	const user = await User.findOne({ loginId }).exec();
	if (!user) {
		throw new Error('Not Found User');
	}

	const { currentCapacity } = user;
	return currentCapacity - value >= 0;
};

export const increaseCurrentCapacity = async ({ loginId, value }: CCFunctionParameter) => {
	const user = await User.findOne({ loginId }).exec();
	if (!user) {
		throw new Error('Not Found User');
	}
	const { maxCapacity, currentCapacity } = user;
	if (currentCapacity + value > maxCapacity) {
		throw new Error(`Can't increase CurrentCapacity`);
	}

	await User.updateOne({ loginId }, { $inc: { currentCapacity: value } });

	return true;
};

export const decreaseCurrentCapacity = async ({ loginId, value }: CCFunctionParameter) => {
	const user = await User.findOne({ loginId }).exec();
	if (!user) {
		throw new Error('Not Found User');
	}
	if (user.currentCapacity - value < 0) {
		throw new Error(`Can't decrease CurrentCapacity`);
	}

	await User.updateOne({ loginId }, { $inc: { currentCapacity: -value } });

	return true;
};

export const updateMaxCapacity = async ({ loginId, maxCapacity }) => {
	if (maxCapacity < 0) {
		throw new Error('maxCapacity must be positive');
	}

	await User.updateOne({ loginId }, { maxCapacity });

	return true;
};
