import { Document, Schema, model } from 'mongoose';

export interface IUser {
	loginId: string;
	password: string;
	directoryId: string;
	maxCapacity: number;
	currentCapacity: number;
}

interface IUserDoc extends IUser, Document {}

const userSchema: Schema<IUserDoc> = new Schema(
	{
		loginId: {
			type: String,
			require: true,
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			require: true,
			trim: true,
		},
		directoryId: {
			type: String,
			require: true,
			unique: true,
		},
		maxCapacity: {
			type: Number,
			require: true,
		},
		currentCapacity: {
			type: Number,
			default: 0,
		},
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

export const User = model<IUserDoc>('User', userSchema);
