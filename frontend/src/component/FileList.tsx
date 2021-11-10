import React, { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';

import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';

import { FileDTO } from '../DTO';

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

const File = styled.li`
	${gridTemplate};
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
`;

interface Props {
	files: FileDTO[];
	setFiles: Dispatch<SetStateAction<FileDTO[]>>;
}

const FileList: React.FC<Props> = ({ files, setFiles }) => {
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
				{files.map((file, index) => {
					const { id, contentType, name, createdAt, updatedAt, size } = file;

					return (
						<File key={index}>
							<ToggleOffSvg />
							<p> {contentType} </p>
							<p> {name} </p>
							<p> {createdAt} </p>
							<p> {updatedAt} </p>
							<p> {size} </p>
						</File>
					);
				})}
			</Files>
		</Container>
	);
};

export default React.memo(FileList);
