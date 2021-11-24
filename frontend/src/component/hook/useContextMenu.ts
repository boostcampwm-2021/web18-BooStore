import { useEffect, useCallback, useState } from 'react';

const useContextMenu = () => {
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);

	const handleContextMenu = useCallback(
		(event) => {
			event.preventDefault();
			setAnchorPoint({ x: event.pageX, y: event.pageY });
			setShow(true);
		},
		[setShow, setAnchorPoint]
	);

	const handleClick = useCallback(() => (show ? setShow(false) : null), [show]);

	useEffect(() => {
		document.addEventListener('click', handleClick);
		return () => {
			document.removeEventListener('click', handleClick);
		};
	}, [show]);

	useEffect(() => {
		document.addEventListener('contextmenu', handleContextMenu);
		return () => {
			document.removeEventListener('contextmenu', handleContextMenu);
		};
	}, [setShow, setAnchorPoint]);

	return { anchorPoint, show };
};

export default useContextMenu;
