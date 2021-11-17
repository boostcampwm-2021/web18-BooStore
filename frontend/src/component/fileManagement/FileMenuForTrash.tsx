import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FileDTO, FileEditAction } from '@DTO';
import { Capacity } from '@model';
import DropBox, { DropBoxItem } from '@component/common/DropBox';
import ModalComponent, { ModalType } from '@component/common/ModalComponent';
import ProgressBar from '@component/common/ProgressBar';
import Button from '@component/common/Button';

import { ReactComponent as ToggleOffSvg } from '@asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '@asset/image/check_box_outline_selected.svg';

interface Props {
	setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;
	selectedFiles: FileDTO[];
	setSelectedFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
}

const FileMenuForTrash: React.FC<Props> = ({
	setCapacity,
	selectedFiles,
	setSelectedFiles,
	setFiles,
}) => {
	const onClickDelete = () => {
		const targetIds = selectedFiles.map((file) => file._id);
		const totalSize = selectedFiles.reduce((prev, file) => prev + file.size, 0);
		const body = {
			targetIds: targetIds,
		};
		fetch('/cloud/files', {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		setFiles((files) => {
			return files.filter((file) => !targetIds.includes(file._id));
		});
		setSelectedFiles([]);
		setCapacity((capacity) => {
			const { currentCapacity } = capacity;
			return { ...capacity, currentCapacity: currentCapacity - totalSize };
		});
	};

	const onClickRestore = () => {
		const targetIds = selectedFiles.map((file) => file._id);
		const body = {
			targetIds: targetIds,
			action: FileEditAction.restore
		};
		fetch('/cloud/files', {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		setFiles((files) => {
			return files.filter((file) => !targetIds.includes(file._id));
		});
		setSelectedFiles([]);
	};

	return (
		<Container>
			<SelectAllBtn>
				<ToggleOffSvg />
			</SelectAllBtn>
			<DownloadButton onClick={onClickRestore} disabled={selectedFiles.length === 0}>
				복원하기
			</DownloadButton>
			<DeleteButton onClick={onClickDelete} disabled={selectedFiles.length === 0}>
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
