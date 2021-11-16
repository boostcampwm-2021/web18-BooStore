import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as ToggleOffSvg } from '../../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../../asset/image/check_box_outline_selected.svg';
import { FileDTO } from '../../DTO';
import { Capacity } from '../../model';
import DropBox, { DropBoxItem } from '../common/DropBox';
import ModalComponent, { ModalType } from '../common/ModalComponent';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';

interface Props {
	showShareButton?: boolean;
	capacity: Capacity;
	setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;
	selectedFiles: FileDTO[];
	currentDir: string;
	setTempUpload: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileMenu: React.FC<Props> = ({
	showShareButton,
	capacity,
	setCapacity,
	selectedFiles,
	currentDir,
	setTempUpload
}) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [failureModalText, setFailureModalText] = useState('유효하지 않은 파일입니다.');
	const [isOpenFailureModal, setOpenFailureModal] = useState(false);
	const [isCompleteSend, setIsCompleteSend] = useState(true);
	const [isOpenProgreeModal, setOpenProgreeModal] = useState(false);
	const [processedFileSize, setProcessedFileSize] = useState(0);
	const [totalFileSize, setTotalFileSize] = useState(0);
	const [progressModalText, setProgressModalText] = useState('Loading...');
	const [selectedFile, setSelectedFile] = useState<FileList | null>(null);

	const onclickFileUploadButton = () => {
		inputFileRef.current?.removeAttribute('webkitdirectory');

		inputFileRef.current?.click();
	};
	const onclickFolderUploadButton = () => {
		inputFileRef.current?.setAttribute('webkitdirectory', '');

		inputFileRef.current?.click();
	};

	const uploadDropBoxItems: DropBoxItem[] = [
		{
			text: '파일로 올리기',
			onClick: onclickFileUploadButton,
		},
		{
			text: '폴더로 올리기',
			onClick: onclickFolderUploadButton,
		},
	];

	const onChangeFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedFile(event.target.files ? event.target.files : null);
	};

	useEffect(() => {
		if (selectedFile === null || selectedFile.length === 0) {
			return;
		}

		handleFileUpload();
		setSelectedFile(null);
	}, [selectedFile]);

	const validateSize = async (totalSize: number) => {
		const { currentCapacity, maxCapacity } = capacity;
		if (currentCapacity + totalSize > maxCapacity) {
			return false;
		}

		const res = await fetch(`/cloud/validate?size=${totalSize}`, {
			credentials: 'include',
		});

		return res.ok;
	};

	const sendFiles = async (selectedFiles: File[], totalSize: number) => {
		const formData = new FormData();

		formData.append('rootDirectory', currentDir);
		let metaData: any = {};
		let sectionSize = 0;
		let processedSize = 0;
		for await (const file of selectedFiles) {
			const { size, name } = file;
			processedSize += size;
			sectionSize += size;

			setProgressModalText(name);
			setProcessedFileSize((prev) => prev + size);
			formData.append('uploadFiles', file, name);
			metaData[file.name] = file.webkitRelativePath;

			// 1MB 단위로 보냄
			if (sectionSize >= 1024 * 1024 || processedSize == totalSize) {
				formData.append('relativePath', JSON.stringify(metaData));

				const res = await fetch(`/cloud/upload`, {
					method: 'POST',
					credentials: 'include',
					body: formData,
				});
				if (!res.ok) {
					throw new Error(res.status.toString());
				}

				setCapacity((cap) => {
					const result: Capacity = { ...cap };
					result.currentCapacity += sectionSize;
					return result;
				});
				formData.delete('uploadFiles');
				formData.delete('relativePath');
				metaData = {};
				sectionSize = 0;
			}
		}
	};

	const handleFileUpload = async () => {
		const selectedFiles = [...(selectedFile as FileList)];
		const totalSize = selectedFiles.reduce((prev, file) => prev + file.size, 0);

		try {
			if (!(await validateSize(totalSize))) {
				throw new Error('허용된 용량을 초과했습니다.');
			}
			setTotalFileSize(totalSize);
			setProcessedFileSize(0);
			setProgressModalText('Loading...');
			setIsCompleteSend(false);
			setOpenProgreeModal(true);

			await sendFiles(selectedFiles, totalSize);
			setTempUpload((prev) => !prev);

			setProgressModalText('Complete!');
			setIsCompleteSend(true);
		} catch (err) {
			setFailureModalText((err as Error).message);
			setOpenFailureModal(true);
		}

		inputFileRef.current!.value = '';
	};

	return (
		<Container>
			<SelectAllBtn>
				<ToggleOffSvg />
			</SelectAllBtn>
			{selectedFiles.length > 0 ? (
				<DownloadButton> 다운로드 </DownloadButton>
			) : (
				<UploadButton nameOfToggleButton={'올리기'} items={uploadDropBoxItems} />
			)}
			{selectedFiles.length > 0 && <DeleteButton> 삭제하기 </DeleteButton>}
			{showShareButton && <ShareButton> 공유하기 </ShareButton>}

			<UploadInput
				multiple
				type="file"
				name="uploadFiles"
				ref={inputFileRef}
				onChange={onChangeFileInput}
			/>
			<FailureModal
				isOpen={isOpenFailureModal}
				setOpen={setOpenFailureModal}
				modalType={ModalType.Error}
			>
				<p>{failureModalText}</p>
			</FailureModal>
			<ProgressModal
				isOpen={isOpenProgreeModal}
				onCloseButton={isCompleteSend}
				setOpen={setOpenProgreeModal}
				modalType={ModalType.Upload}
			>
				<div>
					<p> {progressModalText} </p>
					<ProgressBar value={processedFileSize} maxValue={totalFileSize} />
				</div>
			</ProgressModal>
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

const UploadButton = styled(DropBox)`
	margin-right: 20px;
`;

const DownloadButton = styled(Button)`
	margin-right: 20px;
`;

const DeleteButton = styled(Button)``;

const ShareButton = styled(Button)`
	margin-left: auto;
`;

const UploadInput = styled.input`
	display: none;
`;

const FailureModal = styled(ModalComponent)``;
const ProgressModal = styled(ModalComponent)``;

export default React.memo(FileMenu);
