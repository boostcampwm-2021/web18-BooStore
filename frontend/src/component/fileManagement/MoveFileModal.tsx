import React,{ useCallback } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import DirectoryList from '@component/DirectoryList';
import { FileDTO } from '@DTO';

interface Props{
    onCloseButton?: boolean;
    isOpenMoveFile: boolean;
    setIsOpenMoveFile: React.Dispatch<React.SetStateAction<boolean>>;
    files: FileDTO[];
}

const MoveFileModal: React.FC<Props> = ({onCloseButton = true, isOpenMoveFile ,setIsOpenMoveFile, files })=>{

    

    const onRequestClose = useCallback(() => {
		if (onCloseButton) {
			setIsOpenMoveFile(false);
		}
	}, [onCloseButton]);

    return (
        <ReactModal isOpen={isOpenMoveFile} onRequestClose={onRequestClose} ariaHideApp={false}
        style={{
            content: {
                width: '400px',
                minHeight: '500px',
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
            }
        }}>

        </ReactModal>
    )
}

export default MoveFileModal;