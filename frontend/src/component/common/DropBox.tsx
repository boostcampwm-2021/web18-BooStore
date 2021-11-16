import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from './Button';

export interface DropBoxItem {
	text: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

interface Props {
	items: DropBoxItem[];
	nameOfToggleButton: string;
	className?: string;
}

const DropBox: React.FC<Props> = ({ items, nameOfToggleButton, className }) => {
	const [isOpen, setOpen] = useState(false);
	const dropList = useRef<HTMLDivElement>(null);

	const onClickToggleButton = () => {
		setOpen((prev) => !prev);
	};
	
	const handleCloseModal = (e: MouseEvent) => {
		if (isOpen && !dropList.current?.contains(e.target as Node)) {
			setOpen(false);
		}
	}
	
	const getJSXFromItems = (items: DropBoxItem[]) => {
		const initArray: JSX.Element[] = [];
		
		const jsxList = items.reduce((prev, item, index) => {
			const { text, onClick } = item;
			if (prev.length > 0) {
				prev.push(<hr key={-1}/>);
			}
			prev.push(<DropBoxButton key={index} onClick={onClick}> {text} </DropBoxButton>);
			
			return prev;
		}, initArray);
		
		return jsxList;
	}
	
	useEffect(() => {
		window.addEventListener('click', handleCloseModal);
		return () => {
			window.removeEventListener('click', handleCloseModal)
		}
	}, [isOpen]);
	
	return (
		<Container className={className}>
			<ToggleButton onClick={onClickToggleButton}> {nameOfToggleButton} </ToggleButton>
			{isOpen && (
				<DropList ref={dropList}>
					{getJSXFromItems(items)}
				</DropList>
			)}
		</Container>
	);
};

const Container = styled.div`
	position: relative;
`;
const ToggleButton = styled(Button)`
	height: 100%;
`;

const DropList = styled.div`
	position: absolute;
	margin-top: 10px;

	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
	padding: 10px;
`;
const DropBoxButton = styled(Button)`
	border: none;
	width: 100%;
`;

export default DropBox;
