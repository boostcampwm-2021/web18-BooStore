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
  }
}

interface UlProps{
	size: number;
}


const ContextMenu: React.FC<Props> = ({
	setIsOpenNewFolder, setIsOpenMoveFile, show, anchorPoint, selectedFiles, setFiles=()=>{}
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
		return (
			<ContextDropdown top={anchorPoint.y} left={anchorPoint.x}>
				<li onClick={addNewFolder}>새 폴더 만들기</li>
				<StyledLi onClick={()=>moveFile(selectedFiles.size)} size={selectedFiles.size}>이동</StyledLi>
				<li onClick={addStar}>중요 문서함에 추가</li>
			</ContextDropdown>
		);
	}
	return <></>;
};

  const StyledLi = styled.li<UlProps>`
    color: ${
      (props)=>{
        if(props.size==0){
          return props.theme.color.Line;
        }
      }
    }
  `;

  export default ContextMenu;
