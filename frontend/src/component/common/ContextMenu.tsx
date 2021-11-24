import React,{ useState } from 'react';
import ContextDropdown from '@component/common/ContextDropdown';
import styled from 'styled-components';
import { FileDTO } from '@DTO';

interface Props{
   setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
   setIsOpenMoveFile: React.Dispatch<React.SetStateAction<boolean>>;
   show: boolean;
   anchorPoint: {
    x: number;
    y: number;
  }
  selectedFiles: Map<string, FileDTO>;
}

interface UlProps{
  size: number;
}
const ContextMenu: React.FC<Props> = ( { setIsOpenNewFolder, setIsOpenMoveFile, show, anchorPoint, selectedFiles } ) => {
    
  
  const addNewFolder = () =>{
    setIsOpenNewFolder(true);
  };

  const moveFile = (selectedFilesSize: number)=>
  {
    if(selectedFilesSize!=0){
      setIsOpenMoveFile(true);
    }
  }
  
    if (show) {
      return (
        <ContextDropdown top={anchorPoint.y} left={anchorPoint.x} >
          <li onClick={addNewFolder}>새 폴더 만들기</li>
          <StyledLi onClick={()=>moveFile(selectedFiles.size)} size={selectedFiles.size}>이동</StyledLi>
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