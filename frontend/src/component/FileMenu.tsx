import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';
import ModalComponent from './ModalComponent';

interface Props {
	showShareButton?: boolean;
}

const FileMenu: React.FC<Props> = ({ showShareButton }) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<FileList | null>(null);
	const onClickUpload = () => {
		inputFileRef.current?.click();
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.files ? event.target.files : null);
		setSelectedFile(event.target.files ? event.target.files : null);
	};

	useEffect(() => {
		if (selectedFile !== null) {
			handleFileUpload();
		}
	}, [selectedFile]);

	const handleFileUpload = () => {
		const formData = new FormData();
		Array.prototype.forEach.call(selectedFile, (file) => {
			formData.append('upload', file, file.name);
		});

		fetch(`/cloud/upload`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: formData,
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error(response.status.toString());
				}
			})
			.catch((err) => {
				console.log(err);
				setModalIsOpen(true);
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
				name="singleFile"
				ref={inputFileRef}
				onChange={onChange}
			/>
			<ModalComponent isOpen={modalIsOpen} modalText={'유효하지 않은 파일입니다.'} />
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
