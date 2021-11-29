import React, { useCallback, useState } from 'react';
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
	};
}

const ContextMenu: React.FC<Props> = ({
	setIsOpenNewFolder,
	setIsOpenMoveFile,
	show,
	anchorPoint,
	selectedFiles,
	setFiles = () => {},
}) => {
	const addNewFolder = () => {
		setIsOpenNewFolder(true);
	};

	const moveFile = (selectedFilesSize: number)=>
  {
    if(selectedFilesSize!=0){
      setIsOpenMoveFile(true);
    }
  }

	const addStar = useCallback(() => {
		const targetIds = [...selectedFiles.values()].map((file) => file._id);
		const body = {
			targetIds: targetIds,
			action: FileEditAction.addStar,
		};
		fetch('/cloud/files', {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		setFiles((files) =>
			files.map((file) => {
				const result = { ...file };
				if (targetIds.includes(result._id)) {
					result.isStar = true;
				}
				return result;
			})
		);
	}, [setFiles, selectedFiles]);

	if (show) {
		return (
			<ContextDropdown top={anchorPoint.y} left={anchorPoint.x}>
				<StyledLi onClick={addNewFolder}>새 폴더 만들기</StyledLi>
				<StyledLi onClick={() => moveFile(selectedFiles.size)} disabled={selectedFiles.size === 0}>
					이동
				</StyledLi>
				<StyledLi onClick={addStar}>중요 문서함에 추가</StyledLi>
			</ContextDropdown>
		);
	}
	return <></>;
};

interface UlProps {
	disabled?: boolean;
}
const StyledLi = styled.li<UlProps>`
	cursor: pointer;
	color: ${(props) => {
		if (props.disabled) {
			return props.theme.color.Line;
		}
	}};
	padding-top: 10px;
	padding-bottom: 10px;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
	&:first-child {
		padding-top: 0;
	}
	&:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
`;

export default ContextMenu;

