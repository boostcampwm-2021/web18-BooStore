import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import File from './File';
import { FileDTO } from '@DTO';
import Selection from './Selection';

import useContextMenu from '@component/hook/useContextMenu';
import ContextMenu from '@component/HeaderContextMenu';

import { ReactComponent as AscIcon } from '@asset/image/icons/icon_sort_asc.svg';
import { ReactComponent as DescIcon } from '@asset/image/icons/icon_sort_desc.svg';
import HeaderContextMenu from '@component/HeaderContextMenu';
import NewFolderModal from '@component/fileManagement/NewFolderModal';

interface Props {
	files: FileDTO[];
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>
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
	setFiles,
	setSelectedFiles,
	setCurrentDir,
	currentDirectory,
	isAscending,
	selectedFiles,
	setIsAscending,
	className,
}) => {
	const container = useRef<HTMLDivElement>(null);

	const onClickIsAscending = (event: React.MouseEvent<HTMLDivElement>) => {
		setIsAscending(!isAscending);
	};

	const addSelect = (id: string) => {
		setSelectedFiles((selectedFiles) => {
			if (selectedFiles.has(id)) {
				return selectedFiles;
			}
			
			const result = new Map(selectedFiles);
			const file = files.find((ele) => ele._id === id);
			result.set(id, file!);
			return result;
		});
	};
	const removeSelect = (id: string) => {
		setSelectedFiles((selectedFiles) => {
			if (!selectedFiles.has(id)) {
				return selectedFiles;
			}
			const result = new Map(selectedFiles);
			result.delete(id);
			return result;
		});
	}

	const [isOpenNewFolder,setIsOpenNewFolder] = useState(false);

	return (
		<Container className={className} ref={container}>
			<FileHeader>
				<p></p>
				<p></p>
				<FileHeaderElement onClick={onClickIsAscending}>
					{'이름'} {isAscending ? <AscIcon /> : <DescIcon />}
				</FileHeaderElement>
				<FileHeaderElement> 올린 날짜 </FileHeaderElement>
				<FileHeaderElement> 수정한 날짜 </FileHeaderElement>
				<FileHeaderElement> 파일 크기 </FileHeaderElement>
				<HeaderContextMenu setIsOpenNewFolder={setIsOpenNewFolder}/>
				<NewFolderModal 
					isOpenNewFolder={isOpenNewFolder} 
					setIsOpenNewFolder={setIsOpenNewFolder} 
					setFiles={setFiles}
					curDir={currentDirectory}
				/>
			</FileHeader>
			<Files>
				<Selection selector={'.file'} addSelcted={addSelect} removeSelected={removeSelect} scrollFrame={container.current ?? undefined}>
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
	position: absolute;

	z-index: 1;
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
export default FileList;
