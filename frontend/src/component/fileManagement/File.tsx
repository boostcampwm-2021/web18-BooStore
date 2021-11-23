import React, { useEffect, useState } from 'react';
import styled, { ThemeConsumer } from 'styled-components';
import { convertByteToUnitString, getDate, getFiles } from '@util';
import { FileDTO } from '@DTO';
import FileIcon from './FileIcon';
import { ReactComponent as Star } from '@asset/image/icons/icon_star.svg';

interface Props {
	file: FileDTO;
	setSelectedFiles: React.Dispatch<React.SetStateAction<Map<string, FileDTO>>>;
	setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
	currentDirectory: string;
	selectedFiles: Map<string, FileDTO>;
	className?: string;
}

const File: React.FC<Props> = ({
	file,
	setSelectedFiles,
	setCurrentDir,
	currentDirectory,
	selectedFiles,
	className,
}) => {
	const [isSelected, setSelected] = useState(false);
	const [isStar, setIsStar] = useState(false);
	const { contentType, name, createdAt, updatedAt, size, _id } = file;
	const isFolder = contentType === 'folder';
	const getConvertedSize = convertByteToUnitString(size);

	const onClickFile = (event: React.MouseEvent<HTMLDivElement>) => {
		setSelectedFiles((selectedFiles) => {
			const result = new Map(selectedFiles);
			if (result.has(_id)) {
				result.delete(_id);
			} else {
				result.set(_id, file);
			}

			return result;
		});
	};

	const onClickStar = (event: React.MouseEvent<SVGSVGElement>) => {
		event.stopPropagation();
		setIsStar((isStar) => {
			return !isStar;
		});
	};

	const changeCurrentDirectory = async () => {
		if (isFolder) {
			const childDir =
				currentDirectory === '/' ? currentDirectory + name : currentDirectory + '/' + name;
			setCurrentDir(childDir);
		}
	};

	useEffect(() => {
		if (selectedFiles.has(_id)) {
			setSelected(true);
		} else {
			setSelected(false);
		}
	}, [selectedFiles]);

	useEffect(() => {
		// 디렉토리가 변경되면 선택 상태를 false로 초기화
		setSelected(false);
	}, [currentDirectory]);

	return (
		<Container
			onMouseDown={onClickFile}
			isSelected={isSelected}
			className={className}
			data-id={_id}
		>
			<p>{isFolder}</p>
			<FileIcon type={contentType} />
			<FileNameBox>
				<FileName isFolder={isFolder} onClick={changeCurrentDirectory}>
					{name}
				</FileName>
				{isStar || <Star onMouseDown={onClickStar} />}
			</FileNameBox>

			<MetaData> {getDate(createdAt)} </MetaData>
			<MetaData> {getDate(updatedAt)} </MetaData>
			<MetaData> {isFolder ? '-' : getConvertedSize} </MetaData>
		</Container>
	);
};

const Container = styled.div<{ isSelected: boolean }>`
	display: grid;
	align-items: center;
	grid-template-columns: 20px 60px minmax(100px, 7fr) 3fr 3fr 2fr;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
	background-color: ${({ isSelected, theme }) => isSelected && theme.color.SecondaryBG};
	&:hover {
		background-color: ${({ theme }) => theme.color.SecondaryBG};
	}
`;
const FileNameBox = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding-right: 10%;
	display: flex;
	width: fit-content;
	align-self: center;
`;

const FileName = styled.span<{ isFolder: boolean }>`
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	color: ${(props) => props.theme.color.Content};

	cursor: ${({ isFolder }) => isFolder && 'pointer'};
	margin: auto;
	margin-left: 0;
`;

const MetaData = styled.p`
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	color: ${(props) => props.theme.color.MetaData};
`;

export default React.memo(File);
