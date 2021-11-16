import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FileDTO } from '../../DTO';
import File from './File';
import { ReactComponent as AscIcon } from '../../asset/image/icons/icon_sort_asc.svg';
import { ReactComponent as DescIcon } from '../../asset/image/icons/icon_sort_desc.svg';

interface Props {
	files: FileDTO[];
	setSelectedFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
	currentDirectory: string;
	isAscending: boolean;
	setIsAscending: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileList: React.FC<Props> = ({
	files,
	setSelectedFiles,
	setFiles,
	setCurrentDir,
	currentDirectory,
	isAscending,
	setIsAscending,
}) => {
	const onClickIsAscending = (event: React.MouseEvent<HTMLDivElement>) => {
		setIsAscending(!isAscending);
	};
	return (
		<Container>
			<FileHeader>
				<p></p>
				<p></p>
				<FileHeaderElement onClick={onClickIsAscending}>
					{'이름'} {isAscending ? <AscIcon /> : <DescIcon />}
				</FileHeaderElement>
				<FileHeaderElement> 올린 날짜 </FileHeaderElement>
				<FileHeaderElement> 수정한 날짜 </FileHeaderElement>
				<FileHeaderElement> 파일 크기 </FileHeaderElement>
			</FileHeader>
			<Files>
				{files.map((file, index) => (
					<File
						key={index}
						file={file}
						setSelectedFiles={setSelectedFiles}
						setFiles={setFiles}
						setCurrentDir={setCurrentDir}
						currentDirectory={currentDirectory}
					/>
				))}
			</Files>
		</Container>
	);
};

const Container = styled.div`
	overflow-y: hidden;
	display: flex;
	flex-direction: column;
`;

const gridTemplate = `
	display: grid;
	grid-template-columns: 20px 60px minmax(100px, 7fr) 3fr 3fr 2fr;
`;

const FileHeader = styled.div`
	${gridTemplate};
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
`;

const FileHeaderElement = styled.p`
	display: inline-block;
	display: flex;
	align-items: center;
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Bold};
	color: ${(props) => props.theme.color.Content};
`;

const Files = styled.ul`
	padding: 0;
	margin: 0;
	overflow-y: auto;

	svg {
		cursor: pointer;
		margin: auto;
	}
`;
export default React.memo(FileList);
