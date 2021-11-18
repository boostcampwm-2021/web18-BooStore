import React, { useCallback, useEffect, useRef, useState } from 'react';
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
	className?: string;
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
	const container = useRef<HTMLDivElement>(null);

	const getOffsetPosition = (target: HTMLDivElement, pageX: number, pageY: number) => {
		return {
			offsetX: pageX - target.offsetLeft,
			offsetY: pageY - target.offsetTop,
		};
	};

	const onStartDrag = (event: MouseEvent) => {
		if (!container.current || !container.current.contains(event.target as Element)) {
			return;
		}
		const { pageX, pageY } = event;
		const { offsetX, offsetY } = getOffsetPosition(container.current, pageX, pageY);
		
		setPoint({
			startX: offsetX,
			startY: offsetY,
			endX: offsetX,
			endY: offsetY,
		});
		setDraging(true);
	};
	const onEndDrag = (event: MouseEvent) => {
		setDraging(false);
	};
	const onChangeBox = useCallback(
		(event: MouseEvent) => {
			if (!container.current || !isDraging) {
				return;
			}
			const { pageX, pageY } = event;
			const { offsetWidth, offsetHeight } = container.current;
			let { offsetX, offsetY } = getOffsetPosition(container.current, pageX, pageY);
			
			if (offsetX < 0) {
				offsetX = 0;
			}
			else if (offsetX > offsetWidth) {
				offsetX = offsetWidth;
			}
			if (offsetY < 0) {
				offsetY = 0;
			}
			else if (offsetY > offsetHeight) {
				offsetY = offsetHeight;
			}
			
			setPoint((prev) => ({ ...prev, endX: offsetX, endY: offsetY }));
		},
		[isDraging]
	);
	
	useEffect(() => {
		window.addEventListener('mousemove', onChangeBox);
		
		return () => {
			window.removeEventListener('mousemove', onChangeBox);
		}
	}, [isDraging]);
	
	useEffect(() => {
		window.addEventListener('mousedown', onStartDrag);
		window.addEventListener('mouseup', onEndDrag);
		
		return () => {
			window.removeEventListener('mousedown', onStartDrag);
			window.removeEventListener('mouseup', onEndDrag);
		}
	}, []);

	return (
		<SelectionContainer ref={container}>
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
	height: 100%;
`;
const DragBox = styled.div.attrs<{ ltX: number; ltY: number; rbX: number; rbY: number }>(
	({ltY, ltX, rbY, rbX}) => ({
		style: {
			top: `${ltY}px`,
			left: `${ltX}px`,
			width: `${rbX - ltX}px`,
			height: `${rbY - ltY}px`,
			zIndex: 99,
		}
	})
)<{ ltX: number; ltY: number; rbX: number; rbY: number }>`
	position: absolute;

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
	className
}) => {
	const onClickIsAscending = (event: React.MouseEvent<HTMLDivElement>) => {
		setIsAscending(!isAscending);
	};

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
