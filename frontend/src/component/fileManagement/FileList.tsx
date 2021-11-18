import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import File from './File';
import { FileDTO } from '@DTO';
import Selection from './Selection';

import { ReactComponent as AscIcon } from '@asset/image/icons/icon_sort_asc.svg';
import { ReactComponent as DescIcon } from '@asset/image/icons/icon_sort_desc.svg';

interface Props {
	files: FileDTO[];
	selectedFiles: FileDTO[];
	setSelectedFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
	currentDirectory: string;
	isAscending: boolean;
	setIsAscending: React.Dispatch<React.SetStateAction<boolean>>;
	className?: string;
}

const FileList: React.FC<Props> = ({
	files,
	setSelectedFiles,
	setCurrentDir,
	currentDirectory,
	isAscending,
	selectedFiles,
	setIsAscending,
	className,
}) => {
	const onClickIsAscending = (event: React.MouseEvent<HTMLDivElement>) => {
		setIsAscending(!isAscending);
	};

	const addSelect = (id: string) => {
		setSelectedFiles((selectedFiles) => {
			const result = [...selectedFiles];
			const element = selectedFiles.find((ele) => ele._id == id);
			if (element) {
				return selectedFiles;
			}
			
			const file = files.find((ele) => ele._id === id);
			result.push({ ...file as FileDTO });
			return result;
		});
	};
	const removeSelect = (id: string) => {
		setSelectedFiles((selectedFiles) => {
			return [...selectedFiles].filter((ele) => ele._id !== id);
		});
	}

	return (
		<Container className={className}>
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
				<Selection addSelcted={addSelect} removeSelect={removeSelect}>
					{files.map((file, index) => (
						<File
							className="file"
							key={index}
							file={file}
							selectedFiles={selectedFiles}
							setSelectedFiles={setSelectedFiles}
							setCurrentDir={setCurrentDir}
							currentDirectory={currentDirectory}
						/>
					))}
				</Selection>
			</Files>
		</Container>
	);
};

const Container = styled.div`
	overflow-y: auto;
	overflow-x: hidden;

	display: flex;
	flex-direction: column;
`;

const FileHeader = styled.div`
	display: grid;
	grid-template-columns: 20px 60px minmax(100px, 7fr) 3fr 3fr 2fr;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
	background-color: ${(props) => props.theme.color.PrimaryBG};

	position: sticky;
	top: 0;
`;

const FileHeaderElement = styled.p`
	display: flex;
	align-items: center;
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Bold};
	color: ${(props) => props.theme.color.Content};
`;

const Files = styled.ul`
	padding: 0;
	margin: 0;
	flex: 1;
	user-select: none;

	svg {
		cursor: pointer;
		margin: auto;
	}
`;
export default React.memo(FileList);
