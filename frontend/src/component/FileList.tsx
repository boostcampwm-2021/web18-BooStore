import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';
import TypeIcon from './TypeIcon';
import { FileDTO } from '../DTO';
import File from './File';

interface Props {
	files: FileDTO[];
	setSelectedFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
	currentDirectory : string;
}

const FileList: React.FC<Props> = ({ files, setSelectedFiles, setFiles, setCurrentDir, currentDirectory }) => {
	return (
		<Container>
			<FileHeader>
				<p></p>
				<p> 종류 </p>
				<p> 이름 </p>
				<p> 올린 날짜 </p>
				<p> 수정한 날짜 </p>
				<p> 파일 크기 </p>
			</FileHeader>
			<Files>
				{files.map((file, index) => (
					<File key={index} file={file} setSelectedFiles={setSelectedFiles} setFiles={setFiles} setCurrentDir={setCurrentDir} currentDirectory={currentDirectory}/>
				))}
			</Files>
		</Container>
	);
};

const Container = styled.div``;

const gridTemplate = `
	display: grid;
	grid-template-columns: 1fr 2fr 10fr 2fr 2fr 2fr;
`;

const FileHeader = styled.div`
	${gridTemplate};
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
`;

const Files = styled.ul`
	padding: 0;
	margin: 0;

	svg {
		cursor: pointer;
		margin: auto;
	}
`;
export default React.memo(FileList);
