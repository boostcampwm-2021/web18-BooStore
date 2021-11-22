import React,{ useCallback, useState } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import ModalComponent, { ModalType } from '@component/common/ModalComponent';

interface Props{
    onCloseButton?: boolean;
    isOpenNewFolder: boolean;
    setIsOpenNewFolder: React.Dispatch<React.SetStateAction<boolean>>;
 }

const NewFolderModal: React.FC<Props> = ({ onCloseButton = true,isOpenNewFolder, setIsOpenNewFolder }) => {   
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
    
    if (isOpenNewFolder){
        return (
        <ReactModal isOpen={isOpenNewFolder} onRequestClose={onRequestClose} ariaHideApp={false}>
            <p>새 폴더</p>
            <Input
                name="newFolderName"
                value={newFolderName}
                placeholder="제목 없는 폴더"
                onChange={onChange}
			/>
        </ReactModal>
        )
    }
    return <></>
}

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
		width: '600px',
		minHeight: '275px',
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



export default NewFolderModal;

