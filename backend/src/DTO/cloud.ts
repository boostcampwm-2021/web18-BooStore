export enum FileEditAction {
	trash,
	restore,
	move,
	addStar,
	removeStar,
}

export interface fileDTO{
	_id: string,
	directory: string,
	name: string,
	size: number,
	ownerId: string,
	contentType: string,
	isStar: boolean,
	createdAt: string,
	updatedAt: string
}