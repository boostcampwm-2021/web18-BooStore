import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';

import { FileDTO } from '../DTO';

interface Props {
	file: FileDTO;
	setSelectedFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
}

const FileList: React.FC<Props> = ({ file, setSelectedFiles }) => {
	const [isSelected, setSelected] = useState(false);
	
	const { contentType, name, createdAt, updatedAt, size, _id } = file;
	
	const onClickFile = (event: React.MouseEvent<HTMLDivElement>) => {
		setSelected((prev) => !prev);
		setSelectedFiles((selectedFiles) => {
			const result = [ ...selectedFiles ];
			const element = selectedFiles.find((ele) => {
				return ele._id == _id;
			})
			
			if (typeof element === 'undefined') {
				result.push({ ...file });
				return result;
			}
			
			return result.filter((ele) => ele._id !== _id);
		})
	}
	
	useEffect(() => {
	}, [ isSelected ]);
	
	return (
		<Container onClick={onClickFile} isSelected={isSelected} >
			{ isSelected ? <ToggleOnSvg /> : <ToggleOffSvg /> }
			<p> {contentType} </p>
			<p> {name} </p>
			<p> {createdAt} </p>
			<p> {updatedAt} </p>
			<p> {size} </p>
		</Container>
	);
};

const Container = styled.div<{isSelected: boolean}>`
	display: grid;
	grid-template-columns: 1fr 2fr 10fr 2fr 2fr 2fr;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
	background-color: ${({ isSelected, theme }) => isSelected && theme.color.SecondaryBG};
`;

export default React.memo(FileList);
