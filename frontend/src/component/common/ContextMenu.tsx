import React,{ useState } from 'react';
import ContextDropdown from '@component/common/ContextDropdown';

interface Props{
   setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
   setIsOpenMoveFile: React.Dispatch<React.SetStateAction<boolean>>;
   show: boolean;
   anchorPoint: {
    x: number;
    y: number;
  }
}
const ContextMenu: React.FC<Props> = ( { setIsOpenNewFolder, setIsOpenMoveFile, show, anchorPoint } ) => {
    
  
  const addNewFolder = () =>{
    setIsOpenNewFolder(true);
  };

  const moveFile = ()=>{
    setIsOpenMoveFile(true);
  }
  
    if (show) {
      return (
        <ContextDropdown top={anchorPoint.y} left={anchorPoint.x} >
          <li onClick={addNewFolder}>새 폴더 만들기</li>
          <li onClick={moveFile}>이동</li>
        </ContextDropdown>
      );
    }
    return <></>;
  };
  
  export default ContextMenu;