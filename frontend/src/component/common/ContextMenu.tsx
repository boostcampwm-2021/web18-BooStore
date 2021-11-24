import React, { useCallback, useState } from 'react';
import useContextMenu from '@component/hook/useContextMenu';
import ContextDropdown from '@component/common/ContextDropdown';

import styled from 'styled-components';
import { FileDTO, FileEditAction } from '@DTO';


interface Props {
	setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
	setIsOpenMoveFile: React.Dispatch<React.SetStateAction<boolean>>;
	selectedFiles: Map<string, FileDTO>;
	setFiles?: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	show: boolean;
    anchorPoint: {
		x: number;
		y: number;
  }
}
const HeaderContextMenu: React.FC<Props> = ({
	setIsOpenNewFolder,
	selectedFiles,
	setFiles = () => {},
	setIsOpenMoveFile, show, anchorPoint
}) => {

	const addNewFolder = () => {
		setIsOpenNewFolder(true);
	};

	const moveFile = ()=>{
		setIsOpenMoveFile(true);
	  }

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
		});
		
		setFiles((files) =>
			files.map((file) => {
				const result = {...file};
				if (targetIds.includes(result._id)) {
					result.isStar = true;
				}
				return result;
			})
		);
		
	}, [setFiles, selectedFiles]);

	if (show) {
		// console.log("anchor.x: "+anchorPoint.x+" anchor.y: "+anchorPoint.y);
		return (
			<ContextDropdown top={anchorPoint.y} left={anchorPoint.x}>
				<li onClick={addNewFolder}>새 폴더 만들기</li>
				<li onClick={moveFile}>이동</li>
				<li onClick={addStar}>중요 문서함에 추가</li>
			</ContextDropdown>
		);
	}
	return <></>;
};

export default HeaderContextMenu;
