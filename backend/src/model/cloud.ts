import { Document, Schema, model } from 'mongoose';

export interface ICloud {
	osLink: string;
	name: string;
	size: number;
	directory: string;
	ownerId: string;
	contentType: string;
	isDeleted: boolean;
	isStar: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: Date;
}

interface ICloudDoc extends ICloud, Document {}

const cloudSchema: Schema<ICloudDoc> = new Schema(
	{
		osLink: {
			type: String,
			default: '',
		},
		directory: {
			type: String,
			require: true,
			default: '/',
		},
		name: {
			type: String,
			require: true,
		},
		size: {
			type: Number,
			default: 0,
		},
		ownerId: {
			type: String,
			require: true,
		},
		contentType: {
			type: String,
			required: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		isStar: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
		},
	},
	{
		versionKey: false,
		timestamps: true,
	}
);
export const Cloud = model<ICloudDoc>('Cloud', cloudSchema);
