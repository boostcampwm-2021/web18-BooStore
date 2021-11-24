import React, { useCallback, useState } from 'react';
import useContextMenu from '@component/hook/useContextMenu';
import ContextDropdown from '@component/common/ContextDropdown';
import { FileDTO, FileEditAction } from '@DTO';
import { getFiles } from '@util';

interface Props {
	setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
	selectedFiles: Map<string, FileDTO>;
	setFiles?: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	curDir: string;
}
const HeaderContextMenu: React.FC<Props> = ({
	setIsOpenNewFolder,
	selectedFiles,
	setFiles = () => {},
	curDir,
}) => {
	const { anchorPoint, show } = useContextMenu();

	const addNewFolder = () => {
		setIsOpenNewFolder(true);
	};

	const addStar = useCallback(() => {
		const targetIds = [...selectedFiles.values()].map((file) => file._id);
		const body = {
			targetIds: targetIds,
			action: FileEditAction.addStar,
		};
		fetch('/cloud/files', {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		}).then(async () => {
			setFiles(await getFiles(curDir, true));
		});
	}, [setFiles, selectedFiles]);

	if (show) {
		// console.log("anchor.x: "+anchorPoint.x+" anchor.y: "+anchorPoint.y);
		return (
			<ContextDropdown top={anchorPoint.y} left={anchorPoint.x}>
				<li onClick={addNewFolder}>새 폴더 만들기</li>
				<li onClick={addStar}>중요 문서함에 추가</li>
			</ContextDropdown>
		);
	}
	return <></>;
};

export default HeaderContextMenu;
