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
import { getCapacity } from 'api';

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
		const ids = selectedFiles.map((file) => file._id);
		setFiles((files) => files.filter((file) => !ids.includes(file._id)));

		const targetIds = selectedFiles
			.filter((file) => file.contentType !== 'folder')
			.map((file) => file._id);
		const directories = selectedFiles
			.filter((file) => file.contentType === 'folder')
			.map((file) => {
				const { directory, name } = file;
				if (directory.endsWith('/')) {
					return directory + name;
				}
				return `${directory}/${name}`;
			});
		const body = {
			targetIds: targetIds,
			directorys: directories,
		};
		fetch('/cloud/files', {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then(async () => {
				setCapacity(await getCapacity());
			})
			.catch((err) => {
				console.error(err);
			});

		setSelectedFiles([]);
	};

	const onClickRestore = () => {
		const ids = selectedFiles.map((file) => file._id);
		setFiles((files) => files.filter((file) => !ids.includes(file._id)));

		const targetIds = selectedFiles
			.filter((file) => file.contentType !== 'folder')
			.map((file) => file._id);
		const directories = selectedFiles
			.filter((file) => file.contentType === 'folder')
			.map((file) => {
				const { directory, name } = file;
				if (directory.endsWith('/')) {
					return directory + name;
				}
				return `${directory}/${name}`;
			});
		const body = {
			targetIds: targetIds,
			directorys: directories,
			action: FileEditAction.restore,
		};
		fetch('/cloud/files', {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
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
