import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FileDTO } from '@DTO';
import { Capacity } from '@model';
import Button from '@component/common/Button';
import { ReactComponent as ToggleOffSvg } from '@asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '@asset/image/check_box_outline_selected.svg';

interface Props {
	setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;
	selectedFiles: Map<string, FileDTO>;
	setSelectedFiles: React.Dispatch<React.SetStateAction<Map<string, FileDTO>>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	files: FileDTO[];
}

const FileMenuForStar: React.FC<Props> = ({
	setCapacity,
	selectedFiles,
	setSelectedFiles,
	setFiles,
	files,
}) => {
	const [isOnSelectAll, setOnSelectAll] = useState(false);

	const onClickSelectAll = useCallback(() => {
		if (isOnSelectAll) {
			setSelectedFiles(new Map());
		} else {
			const newMap = files.reduce((prev, file) => {
				prev.set(file._id, file);
				return prev;
			}, new Map<string, FileDTO>());
			setSelectedFiles(newMap);
		}

		setOnSelectAll((prev) => !prev);
	}, [files, selectedFiles, isOnSelectAll]);

	return (
		<Container>
			<SelectAllBtn onClick={onClickSelectAll}>
				{isOnSelectAll ? <ToggleOnSvg /> : <ToggleOffSvg />}
			</SelectAllBtn>
		</Container>
	);
};

const Container = styled.div`
	padding: 15px 20px;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};

	display: flex;
`;

const SelectAllBtn = styled.button`
	cursor: pointer;

	padding: 0;
	margin-right: 20px;

	display: flex;
	justify-content: center;
	align-items: center;
`;

export default React.memo(FileMenuForStar);
