import React, { useEffect, useState } from 'react';
import styled, { ThemeConsumer } from 'styled-components';

import { ReactComponent as ToggleOffSvg } from '../../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../../asset/image/check_box_outline_selected.svg';

import { FileDTO } from '../../DTO';
import FileIcon from './FileIcon';
import { getFiles } from '../../util';

interface Props {
	file: FileDTO;
	setSelectedFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
	currentDirectory: string;
}

const File: React.FC<Props> = ({
	file,
	setSelectedFiles,
	setFiles,
	setCurrentDir,
	currentDirectory,
}) => {
	const [isSelected, setSelected] = useState(false);

	const { contentType, name, createdAt, updatedAt, size, _id } = file;

	const onClickFile = (event: React.MouseEvent<HTMLDivElement>) => {
		setSelected((prev) => !prev);
		setSelectedFiles((selectedFiles) => {
			const result = [...selectedFiles];
			const element = selectedFiles.find((ele) => {
				return ele._id == _id;
			});

			if (typeof element === 'undefined') {
				result.push({ ...file });
				return result;
			}

			return result.filter((ele) => ele._id !== _id);
		});
	};

	const getChildrenFiles = async (isFolder: boolean, childDirectory: string) => {
		if (isFolder) {
			const files = await getFiles(childDirectory);
			setFiles(files);
			setCurrentDir(childDirectory);
			setSelectedFiles([]);
			setSelected(false);
		}
	};

	useEffect(() => {}, [isSelected]);

	const childDir =
		currentDirectory === '/' ? currentDirectory + name : currentDirectory + '/' + name;
	const isFolder = contentType === 'folder';

	useEffect(() => {}, []);

	return (
		<Container onClick={onClickFile} isSelected={isSelected}>
			<p>{isFolder}</p>
			<FileIcon type={contentType} />
			<FileName isFolder={isFolder} onClick={() => getChildrenFiles(isFolder, childDir)}>
				{name}
			</FileName>
			<MetaData> {createdAt} </MetaData>
			<MetaData> {updatedAt} </MetaData>
			<MetaData> {size} </MetaData>
		</Container>
	);
};

const Container = styled.div<{ isSelected: boolean }>`
	display: grid;
	align-items: center;
	grid-template-columns: 20px 60px 10fr 2fr 2fr 2fr;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
	background-color: ${({ isSelected, theme }) => isSelected && theme.color.SecondaryBG};
	&:hover {
		background-color: ${({ theme }) => theme.color.SecondaryBG};
	}
`;

const FileName = styled.div<{ isFolder: boolean }>`
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	color: ${(props) => props.theme.color.Content};
	&:hover {
		cursor: default;
	}
	margin: auto 0px;
`;

const MetaData = styled.p`
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	color: ${(props) => props.theme.color.MetaData};
`;

export default React.memo(File);
