import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import ModalComponent, { ModalType } from '@component/common/ModalComponent';
import Button from '@component/common/Button';
import { FileDTO } from '@DTO';

<<<<<<< HEAD
interface Props {
	onCloseButton?: boolean;
	isOpenNewFolder: boolean;
	setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
	setFiles: React.Dispatch<React.SetStateAction<FileDTO[]>>;
	curDir: string;
}

const NewFolderModal: React.FC<Props> = ({
	onCloseButton = true,
	isOpenNewFolder,
	setIsOpenNewFolder,
	setFiles,
	curDir,
}) => {
	const [newFolderName, setNewFolderName] = useState('제목없는 폴더');
=======
interface Props{
    onCloseButton?: boolean;
    isOpenNewFolder: boolean;
    setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
    setFiles : React.Dispatch<React.SetStateAction<FileDTO[]>>;
 }

const NewFolderModal: React.FC<Props> = ({ onCloseButton = true,isOpenNewFolder, setIsOpenNewFolder,setFiles }) => {   
    const [newFolderName, setNewFolderName] = useState('제목없는 폴더');
>>>>>>> 3c449f8 ([Feat] 새 폴더에 필요한 fetch 요청 추가)

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
		const addedFolder: FileDTO = await handleNewFolder();
		setFiles((oldArr) => [...oldArr, addedFolder]);
		setNewFolderName('제목없는 폴더');
		onRequestClose();
	};

	const handleNewFolder = async () => {
		return fetch(`/cloud/newfolder`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: { newFolderName },
				curdir: { curDir },
			}),
		}).then((res) => {
			return res.json();
		});
	};

	if (isOpenNewFolder) {
		return (
			<ReactModal
				isOpen={isOpenNewFolder}
				onRequestClose={onRequestClose}
				ariaHideApp={false}
			>
				<InputContainer>
					<p>새 폴더</p>
					<Input
						name="newFolderName"
						value={newFolderName}
						placeholder="제목 없는 폴더"
						onChange={onChange}
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
	padding: 20px 20px 20px 40px;
	margin-bottom: 20px;
	&:focus {
		outline: none;
	}
`;

ReactModal.defaultStyles = {
	overlay: {
		zIndex: 10,
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(196, 196, 196, 0.5)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
<<<<<<< HEAD
<<<<<<< HEAD
		width: '400px',
		minHeight: '180px',
=======
		width: '600px',
		minHeight: '275px',
>>>>>>> 85ac602 ([Feat] 새 폴더 추가하는 모달 구현)
=======
		width: '400px',
		minHeight: '180px',
>>>>>>> 3c449f8 ([Feat] 새 폴더에 필요한 fetch 요청 추가)
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
};

<<<<<<< HEAD
<<<<<<< HEAD
const InputContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: left;
`;

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
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
=======
=======
const InputContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: left;
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
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

>>>>>>> 3c449f8 ([Feat] 새 폴더에 필요한 fetch 요청 추가)


export default NewFolderModal;

>>>>>>> 85ac602 ([Feat] 새 폴더 추가하는 모달 구현)
