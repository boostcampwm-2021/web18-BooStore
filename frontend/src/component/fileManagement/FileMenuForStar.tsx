import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FileDTO } from '@DTO';
import { Capacity } from '@model';
import Button from '@component/common/Button';
import { ReactComponent as ToggleOffSvg } from '@asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '@asset/image/check_box_outline_selected.svg';
import ModalComponent, { ModalType } from '@component/common/ModalComponent';
import path from 'path';

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
	const [failureModalText, setFailureModalText] = useState('유효하지 않은 파일입니다.');
	const [isOpenFailureModal, setOpenFailureModal] = useState(false);
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

	const onClickDownload = () => {
		const targetIds = [...selectedFiles.values()]
			.filter((file) => file.contentType !== 'folder')
			.map((file) => file._id)
			.reduce((acc, cur) => {
				return (acc += 'files=' + cur + '&');
			}, '');
		const filesQuery = targetIds === '' ? 'files=&' : targetIds;

		const directories = [...selectedFiles.values()]
			.filter((file) => file.contentType === 'folder')
			.map((file) => {
				return path.join(file.directory, file.name).substring(1);
			})
			.reduce((acc, cur) => {
				return (acc += 'folders=' + cur + '&');
			}, '');
		const directoriesQuery =
			directories === '' ? 'folders=' : directories.substr(0, directories.length - 1);

		const queryString = `current_dir=/&${filesQuery}${directoriesQuery}`;
		fetch(`/cloud/download?${queryString}`, {
			credentials: 'include',
		})
			.then((res) => {
				if (res.ok) {
					return res;
				} else if (res.status === 401) {
					throw new Error('올바른 사용자가 아닙니다. 로그인 후 사용해주십시오.');
				} else {
					throw new Error('올바른 요청이 아닙니다.');
				}
			})
			.then(async (res) => {
				const fileName = /attachment; filename="(?<fileName>[^"]+)"/.exec(
					res.headers.get('Content-Disposition') as string
				)?.groups?.fileName;
				const blob = await res.blob();
				return { fileName: fileName, blob: blob };
			})
			.then(({ fileName, blob }) => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = fileName as string;
				document.body.appendChild(a);
				a.click();
				a.remove();
			})
			.catch((err) => {
				setFailureModalText((err as Error).message);
				setOpenFailureModal(true);
			});
	};

	return (
		<Container>
			<SelectAllBtn onClick={onClickSelectAll}>
				{isOnSelectAll ? <ToggleOnSvg /> : <ToggleOffSvg />}
			</SelectAllBtn>
			<DownloadButton onClick={onClickDownload}> 다운로드 </DownloadButton>
			<FailureModal
				isOpen={isOpenFailureModal}
				setOpen={setOpenFailureModal}
				modalType={ModalType.Error}
			>
				<p>{failureModalText}</p>
			</FailureModal>
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
	border: 1px solid ${(props)=> props.theme.color.Line};
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

const FailureModal = styled(ModalComponent)``;
const ProgressModal = styled(ModalComponent)``;
export default React.memo(FileMenuForStar);
