import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

export interface DropBoxItem {
	text: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

interface Props {
	items: DropBoxItem[];
	nameOfToggleButton: string;
}

const DropBox: React.FC<Props> = ({ items, nameOfToggleButton }) => {
	const [toggleUploadDropBox, setToggleUploadDropBox] = useState(false);
	const dropList = useRef<HTMLDivElement>(null);

	const onClickActButton = () => {
		setToggleUploadDropBox((prev) => !prev);
	};
	
	const getJSXFromItems = (items: DropBoxItem[]) => {
		const initArray: JSX.Element[] = [];
		
		const jsxList = items.reduce((prev, item, index) => {
			const { text, onClick } = item;
			if (prev.length > 0) {
				prev.push(<hr/>);
			}
			prev.push(<DropBoxButton key={index} onClick={onClick}> {text} </DropBoxButton>);
			
			return prev;
		}, initArray);
		
		return jsxList;
	}
	
	return (
		<Container>
			<ActButton onClick={onClickActButton}> {nameOfToggleButton} </ActButton>
			{!toggleUploadDropBox || (
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
const ActButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
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
const DropBoxButton = styled.button`
	outline: none;
	cursor: pointer;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	border: none;
	width: 100%;
	text-align: center;
	font-size: 14px;
`;

export default DropBox;
