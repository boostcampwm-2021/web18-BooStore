import useContextMenu from '@util/useContextMenu';
import ContextDropDown from '@component/common/ContextDropdown';
import ContextDropdown from '@component/common/ContextDropdown';

const ContextMenu = (location: string) => {
    const { anchorPoint, show } = useContextMenu();
  
    if (show) {
      return (
        <ContextDropdown top={anchorPoint.y} left={anchorPoint.x} >
          <li>Copy</li>
          <li>Paste</li>
          <hr />
          <li>Refresh</li>
          <li>Exit</li>
        </ContextDropdown>
      );
    }
    return <></>;
  };
  
  export default ContextMenu;