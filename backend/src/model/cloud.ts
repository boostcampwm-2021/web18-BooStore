import { Document, Schema, model } from 'mongoose';

export interface ICloud {
	osLink: string;
	name: string;
	size: number;
	directory: string;
	ownerId: string;
	contentType: string;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: Date;
}

interface ICloudDoc extends ICloud, Document {}

const cloudSchema: Schema<ICloudDoc> = new Schema(
	{
		osLink: {
			type: String,
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
			require: true,
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
		deletedAt: {
			type: Date,
		}
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

export const Cloud = model<ICloudDoc>('Cloud', cloudSchema);
