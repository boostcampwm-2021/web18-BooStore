import React,{ useState } from 'react';
import useContextMenu from '@component/hook/useContextMenu';
import ContextDropdown from '@component/common/ContextDropdown';

interface Props{
   setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
}
const HeaderContextMenu: React.FC<Props> = ( { setIsOpenNewFolder } ) => {
    
  const { anchorPoint, show } = useContextMenu();
  
  const addNewFolder = () =>{
     setIsOpenNewFolder(true);
  };
  
    if (show) {
      return (
        <ContextDropdown top={anchorPoint.y} left={anchorPoint.x} >
          <li onClick={addNewFolder}>새 폴더 만들기</li>
        </ContextDropdown>
      );
    }
    return <></>;
  };
  
  export default HeaderContextMenu;