import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FileDTO, FileEditAction } from '@DTO';
import { Capacity } from '@model';
import DropBox, { DropBoxItem } from '@component/common/DropBox';
import ModalComponent, { ModalType } from '@component/common/ModalComponent';
import ProgressBar from '@component/common/ProgressBar';
import Button from '@component/common/Button';

import { ReactComponent as ToggleOffSvg } from '@asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '@asset/image/check_box_outline_selected.svg';
import { moveFileToTrash } from '@api';
import { getFiles } from '@util';

interface Props {
	showShareButton?: boolean;
	capacity: Capacity;
	setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;
	selectedFiles: Map<string, FileDTO>;
	setSelectedFiles: React.Dispatch<React.SetStateAction<Map<string, FileDTO>>>;
	currentDir: string;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	files: FileDTO[];
	updateFiles?: Function;
}

const FileMenuForMain: React.FC<Props> = ({
	showShareButton,
	capacity,
	setCapacity,
	selectedFiles,
	setSelectedFiles,
	currentDir,
	setFiles,
	files,
	updateFiles = () => {},
}) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [failureModalText, setFailureModalText] = useState('유효하지 않은 파일입니다.');
	const [isOpenFailureModal, setOpenFailureModal] = useState(false);
	const [isCompleteSend, setIsCompleteSend] = useState(true);
	const [isOpenProgreeModal, setOpenProgreeModal] = useState(false);
	const [processedFileSize, setProcessedFileSize] = useState(0);
	const [totalFileSize, setTotalFileSize] = useState(0);
	const [progressModalText, setProgressModalText] = useState('Loading...');
	const [selectedUploadFiles, setSelectedUploadFiles] = useState<FileList | null>(null);
	const [isOnSelectAll, setOnSelectAll] = useState(false);

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
		setSelectedUploadFiles(event.target.files);
	};

	const onClickDownload = async () => {
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
				return file.name;
			})
			.reduce((acc, cur) => {
				return (acc += 'folders=' + cur + '&');
			}, '');
		const directoriesQuery =
			directories === '' ? 'folders=' : directories.substr(0, directories.length - 1);

		const queryString = `current_dir=${currentDir}&${filesQuery}${directoriesQuery}`;
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

	const onClickDelete = async () => {
		const ids = [...selectedFiles.keys()];
		setFiles((files) => files.filter((file) => !ids.includes(file._id)));

		await moveFileToTrash(selectedFiles);

		setSelectedFiles(new Map());
	};

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

	const getNotOverlappedName = async (folderName: string): Promise<string> => {
		const trashFiles = await getFiles(currentDir, true, true);
		let file = files.find((file) => file.name === folderName);
		if (file === undefined) {
			file = trashFiles.find((file) => file.name === folderName);
			if (file === undefined) {
				return folderName;
				
			}
		}

		const leftBracketIndex = folderName.lastIndexOf('(');
		const rightBracketIndex = folderName.lastIndexOf(')');
		if (
			leftBracketIndex === -1 ||
			rightBracketIndex === -1 ||
			rightBracketIndex !== folderName.length - 1 ||
			leftBracketIndex + 1 >= rightBracketIndex
		) {
			return getNotOverlappedName(`${folderName}(1)`);
		}

		const strInsideBracket = folderName.slice(leftBracketIndex + 1, rightBracketIndex);
		const overlapNumber = Number(strInsideBracket);
		if (isNaN(overlapNumber)) {
			return getNotOverlappedName(`${folderName}(1)`);
		}

		const newFilename = `${folderName.slice(0, leftBracketIndex)}(${overlapNumber + 1})`;
		return getNotOverlappedName(newFilename);
	};

	const sendFiles = async (selectedUploadFiles: File[], totalSize: number) => {
		const formData = new FormData();

		const relativePaths: Map<string, string> = new Map();
		if (selectedUploadFiles[0].webkitRelativePath != '') {
			const relativePath = selectedUploadFiles[0].webkitRelativePath;
			const createdFolderName = relativePath.split('/')[0];
			const notOverlappedName = await getNotOverlappedName(createdFolderName);

			if (createdFolderName === notOverlappedName) {
				selectedUploadFiles.forEach((file) => {
					const { webkitRelativePath: wRP, name } = file;

					relativePaths.set(name, wRP);
				});
			} else {
				selectedUploadFiles.forEach((file) => {
					const { webkitRelativePath: wRP, name } = file;

					relativePaths.set(
						name,
						`${notOverlappedName}/${wRP.split('/').slice(1).join('/')}`
					);
				});
			}
		} else {
			selectedUploadFiles.forEach((file) => {
				const { webkitRelativePath: wRP, name } = file;

				relativePaths.set(name, wRP);
			});
		}

		formData.append('rootDirectory', currentDir);
		let metaData: any = {};
		let sectionSize = 0;
		let processedSize = 0;
		for await (const file of selectedUploadFiles) {
			const { size, name } = file;
			processedSize += size;
			sectionSize += size;

			setProgressModalText(name);
			setProcessedFileSize((prev) => prev + size);
			formData.append('uploadFiles', file, name);
			metaData[name] = relativePaths.get(name);

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
		const uploadFiles = [...(selectedUploadFiles as FileList)];
		const totalSize = uploadFiles.reduce((prev, file) => prev + file.size, 0);

		try {
			if (!(await validateSize(totalSize))) {
				throw new Error('허용된 용량을 초과했습니다.');
			}
			setTotalFileSize(totalSize);
			setProcessedFileSize(0);
			setProgressModalText('Loading...');
			setIsCompleteSend(false);
			setOpenProgreeModal(true);

			await sendFiles(uploadFiles, totalSize);
			updateFiles();

			setProgressModalText('Complete!');
			setIsCompleteSend(true);
		} catch (err) {
			setFailureModalText((err as Error).message);
			setOpenFailureModal(true);
		}

		inputFileRef.current!.value = '';
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
	}, [files, isOnSelectAll]);

	useEffect(() => {
		if (selectedUploadFiles === null || selectedUploadFiles.length === 0) {
			return;
		}

		handleFileUpload();
		setSelectedUploadFiles(null);
	}, [selectedUploadFiles]);

	useEffect(() => {
		if (files.length === 0) {
			setOnSelectAll(false);
		} else if (selectedFiles.size === files.length) {
			setOnSelectAll(true);
		} else {
			setOnSelectAll(false);
		}
	}, [selectedFiles, files]);

	return (
		<Container>
			<SelectAllBtn onClick={onClickSelectAll}>
				{isOnSelectAll ? <ToggleOnSvg /> : <ToggleOffSvg />}
			</SelectAllBtn>
			{selectedFiles.size > 0 ? (
				<DownloadButton onClick={onClickDownload}> 다운로드 </DownloadButton>
			) : (
				<UploadButton nameOfToggleButton={'올리기'} items={uploadDropBoxItems} />
			)}
			{selectedFiles.size > 0 && (
				<DeleteButton onClick={onClickDelete}> 삭제하기 </DeleteButton>
			)}
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
				<span> {progressModalText} </span>
				<ProgressBar value={processedFileSize} maxValue={totalFileSize} />
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

export default React.memo(FileMenuForMain);
