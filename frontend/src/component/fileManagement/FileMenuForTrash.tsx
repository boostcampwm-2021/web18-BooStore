import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { FileDTO } from '@DTO';
import { Capacity } from '@model';
import Button from '@component/common/Button';

import { ReactComponent as ToggleOffSvg } from '@asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '@asset/image/check_box_outline_selected.svg';
import { getCapacity, removeFile, restoreTrashFile } from 'api';

interface Props {
	setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;
	selectedFiles: Map<string, FileDTO>;
	setSelectedFiles: React.Dispatch<React.SetStateAction<Map<string, FileDTO>>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	files: FileDTO[];
}

const FileMenuForTrash: React.FC<Props> = ({
	setCapacity,
	selectedFiles,
	setSelectedFiles,
	setFiles,
	files,
}) => {
	const [isOnSelectAll, setOnSelectAll] = useState(false);

	const onClickDelete = () => {
		const ids = [...selectedFiles.keys()];
		setFiles((files) => files.filter((file) => !ids.includes(file._id)));

		removeFile(selectedFiles)
			.then(() => getCapacity())
			.then((capacity) => setCapacity(capacity))
			.catch((err) => {
				console.error(err);
			});

		setSelectedFiles(new Map());
	};

	const onClickRestore = () => {
		const ids = [...selectedFiles.keys()];
		setFiles((files) => files.filter((file) => !ids.includes(file._id)));

		restoreTrashFile(selectedFiles);

		setSelectedFiles(new Map());
	};

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
			<DownloadButton onClick={onClickRestore} disabled={selectedFiles.size === 0}>
				복원하기
			</DownloadButton>
			<DeleteButton onClick={onClickDelete} disabled={selectedFiles.size === 0}>
				삭제하기
			</DeleteButton>
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
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 4px;
	padding: 0;
	margin-right: 20px;

	display: flex;
	justify-content: center;
	align-items: center;
`;

const DownloadButton = styled(Button)`
	margin-right: 20px;
`;

const DeleteButton = styled(Button)``;

export default React.memo(FileMenuForTrash);
