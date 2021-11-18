import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import File from './File';
import { FileDTO } from '@DTO';

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
}

interface SelectionProps {}

const Selection: React.FC<SelectionProps> = ({ children }) => {
	const [point, setPoint] = useState({
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	});
	const [isDraging, setDraging] = useState(false);

	const getOffsetPosition = (event: React.MouseEvent<HTMLDivElement>) => {
		return {
			offsetX: event.pageX - event.currentTarget.offsetLeft,
			offsetY: event.pageY - event.currentTarget.offsetTop,
		};
	};

	const onStartDrag = (event: React.MouseEvent<HTMLDivElement>) => {
		const { offsetX, offsetY } = getOffsetPosition(event);

		setPoint({
			startX: offsetX,
			startY: offsetY,
			endX: offsetX,
			endY: offsetY,
		});
		setDraging(true);
	};
	const onEndDrag = (event: React.MouseEvent<HTMLDivElement>) => {
		setDraging(false);
	};
	const onChangeBox = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (!isDraging) {
				return;
			}

			const { offsetX, offsetY } = getOffsetPosition(event);
			setPoint((prev) => ({ ...prev, endX: offsetX, endY: offsetY }));
		},
		[isDraging]
	);

	return (
		<SelectionContainer
			onMouseDown={onStartDrag}
			onMouseUp={onEndDrag}
			onMouseMove={onChangeBox}
		>
			{isDraging && (
				<DragBox
					ltX={Math.min(point.startX, point.endX)}
					ltY={Math.min(point.startY, point.endY)}
					rbX={Math.max(point.startX, point.endX)}
					rbY={Math.max(point.startY, point.endY)}
				/>
			)}
			{children}
		</SelectionContainer>
	);
};
const SelectionContainer = styled.div`
	position: relative;
`;
const DragBox = styled.div<{ ltX: number; ltY: number; rbX: number; rbY: number }>`
	position: absolute;
	top: ${({ ltY }) => ltY}px;
	left: ${({ ltX }) => ltX}px;
	width: ${({ ltX, rbX }) => rbX - ltX}px;
	height: ${({ ltY, rbY }) => rbY - ltY}px;

	background-color: rgba(155, 193, 239, 0.4);
`;

const FileList: React.FC<Props> = ({
	files,
	setSelectedFiles,
	setCurrentDir,
	currentDirectory,
	isAscending,
	selectedFiles,
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
				<Selection>
					{files.map((file, index) => (
						<File
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

	svg {
		cursor: pointer;
		margin: auto;
	}
	user-select: none;
`;
export default React.memo(FileList);
