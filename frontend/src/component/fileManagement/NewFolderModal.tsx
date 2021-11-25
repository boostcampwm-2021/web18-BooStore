import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import ModalComponent, { ModalType } from '@component/common/ModalComponent';
import Button from '@component/common/Button';
import { FileDTO } from '@DTO';
import { handleNewFolder } from 'api';
import { getFiles, getNotOverlappedName } from '@util';

interface Props {
	onCloseButton?: boolean;
	isOpenNewFolder: boolean;
	setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	files: FileDTO[];
	curDir: string;
}

const NewFolderModal: React.FC<Props> = ({
	onCloseButton = true,
	isOpenNewFolder,
	setIsOpenNewFolder,
	setFiles,
	files,
	curDir,
}) => {
	const [newFolderName, setNewFolderName] = useState('');
	const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = target;
		setNewFolderName(value);
	};

	const onRequestClose = useCallback(() => {
		if (onCloseButton) {
			setIsOpenNewFolder(false);
		}
	}, [onCloseButton]);

	const makeNewFolder = async () => {
		onRequestClose();
		const notOverlappedName = await getNotOverlappedName(curDir, newFolderName);
		await handleNewFolder(notOverlappedName, curDir);
		setFiles(await getFiles(curDir, true));
		setNewFolderName('');
	};

	const onInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			makeNewFolder();
		}
	}
	
	if (isOpenNewFolder) {
		return (
			<ReactModal
				isOpen={isOpenNewFolder}
				onRequestClose={onRequestClose}
				ariaHideApp={false}
				style={{
					content: {
						width: '400px',
						minHeight: '180px',
						border: '1px solid #ccc',
						background: '#fff',
						overflow: 'auto',
						WebkitOverflowScrolling: 'touch',
						borderRadius: '4px',
						outline: 'none',
						padding: '20px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					},
				}}
			>
				<InputContainer>
					<p>새 폴더</p>
					<Input
						name="newFolderName"
						value={newFolderName}
						placeholder="제목 없는 폴더"
						autoComplete="off"
						onChange={onChange}
						onKeyPress={onInputKeyPress}
					/>
					<ButtonContainer>
						<MakeFolderButton onClick={makeNewFolder}>만들기</MakeFolderButton>
					</ButtonContainer>
				</InputContainer>
			</ReactModal>
		);
	}
	return <></>;
};

const Input = styled.input`
	width: 300px;
	height: 45px;
	border: solid 1px ${(props) => props.theme.color.Primary};
	border-radius: 8px;
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	padding: 20px 20px 20px 20px;
	margin-bottom: 20px;
	&:focus {
		outline: none;
	}
`;

const InputContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
`;

const MakeFolderButton = styled(Button)`
	background-color: ${(props) => props.theme.color.Primary};
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.3);
	color: white;
	padding: 10px;
	border: none;
	box-shadow: 3px 1px 3px grey;
	font-size: ${(props) => props.theme.fontSize.Content};
	float: 'right';
`;

export default NewFolderModal;
