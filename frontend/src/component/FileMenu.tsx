import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';
import { Capacity } from '../model';
import ModalComponent from './ModalComponent';

interface Props {
	showShareButton?: boolean;
	capacity: Capacity;
	setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;
}

const FileMenu: React.FC<Props> = ({ showShareButton, capacity, setCapacity }) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [modalText, setModalText] = useState('유효하지 않은 파일입니다.');
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<FileList | null>(null);
	const onClickUpload = () => {
		inputFileRef.current?.click();
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedFile(event.target.files ? event.target.files : null);
	};

	useEffect(() => {
		if (selectedFile === null || selectedFile.length === 0) {
			return;
		}

		handleFileUpload();
		setSelectedFile(null);
	}, [selectedFile]);

	const handleFileUpload = () => {
		const formData = new FormData();
		const { currentCapacity, maxCapacity } = capacity;

		let totalSize = 0;
		const selectedFiles = [...(selectedFile as FileList)];
		const metaData: any = {};
		inputFileRef.current!.value = '';
		selectedFiles.forEach((file) => {
			formData.append('uploadFiles', file, file.name);
			metaData[file.name] = file.webkitRelativePath;
			totalSize += file.size;
		});

		formData.append('relativePath', JSON.stringify(metaData));
		formData.append('rootDirectory', '/'); // 추후에는 클라우드상의 현재 디렉토리를 인자로 넣어준다.

		if (currentCapacity + totalSize > maxCapacity) {
			setModalText('용량 초과');
			setModalIsOpen(true);

			return;
		}

		fetch(`/cloud/validate?size=${totalSize}`, {
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error('용량 초과');
				}
				return fetch(`/cloud/upload`, {
					method: 'POST',
					credentials: 'include',
					body: formData,
				});
			})
			.then((response) => {
				if (response.ok) {
					return;
				} else {
					throw new Error(response.status.toString());
				}
			})
			.catch((err) => {
				setModalText(err.message);
				setModalIsOpen((prev) => !prev);
			});
	};

	return (
		<Container>
			<SelectAllBtn>
				<ToggleOffSvg />
			</SelectAllBtn>
			<ActButton onClick={onClickUpload}>올리기</ActButton>
			<UploadInput
				multiple
				type="file"
				name="uploadFiles"
				ref={inputFileRef}
				onChange={onChange}
			/>
			<ModalComponent
				isOpen={modalIsOpen}
				setModalIsOpen={setModalIsOpen}
				modalText={modalText}
			/>
			{!showShareButton || <ShareButton> 공유하기 </ShareButton>}
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

const ActButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
`;

const ShareButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;

	margin-left: auto;
`;

const UploadInput = styled.input`
	display: none;
`;

const FlexMiddleDiv = styled.div`
	display: flex;
	justify-content: center;

	margin-top: 30px;
`;

export const ModalButton = styled.div`
	background-color: ${(props) => props.theme.color.Primary};
	border: none;
	border-radius: 6px;
	color: ${(props) => props.theme.color.PrimaryBG};
	font-size: 12px;
	padding: 10px;
`;

export default React.memo(FileMenu);
function userEffect(arg0: () => void) {
	throw new Error('Function not implemented.');
}
