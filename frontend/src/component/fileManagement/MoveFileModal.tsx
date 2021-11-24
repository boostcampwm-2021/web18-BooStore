import React,{ useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import { getDirectoryList } from 'api';
import { handleMoveFile } from 'api';
import { FileDTO } from '@DTO';
import Button from '@component/common/Button';

interface Props{
    onCloseButton?: boolean;
    isOpenMoveFile: boolean;
    setIsOpenMoveFile: React.Dispatch<React.SetStateAction<boolean>>;
    selectedFiles: Map<string, FileDTO>;
    curDir : string;
}

const MoveFileModal: React.FC<Props> = ({onCloseButton = true, isOpenMoveFile ,setIsOpenMoveFile, selectedFiles, curDir })=>{

    const [directories, setDirectories] = useState<string[]>([]);
    const [newDirectory, setNewDirectory] = useState<string>('');

    const handleDirectoryList = () => {
        const asyncFunc = async () => {
            let tempDirectories = await getDirectoryList();
            tempDirectories = tempDirectories.filter((dir: string) => dir != curDir);
            tempDirectories.push('/');
            setDirectories(tempDirectories);
        }
        asyncFunc();
    }

    const chooseNewDir= (directory: string)=>{
        setNewDirectory(directory);
    }
    const editDir = (directory: string)=>{
        if(directory==='/') return '내 스토어';
        else{
            return directory.split('/').slice(-1)[0];
        }
    }

    const moveFile = async()=>{
        await handleMoveFile(selectedFiles,newDirectory);
    }

    const makeDirectoryList = useCallback(()=>{
        return directories.map((directory:string) => {
            return (
                <StyledDiv key={directory} onClick={()=>{chooseNewDir(directory);}} >
                    { editDir(directory) }
                </StyledDiv>
            )
        })
    },[directories]);
    
    useEffect(()=>{
        handleDirectoryList();
    },[]);

    const onRequestClose = useCallback(() => {
		if (onCloseButton) {
			setIsOpenMoveFile(false);
		}
	}, [onCloseButton]);

    if(isOpenMoveFile){
        return (
            <ReactModal isOpen={isOpenMoveFile} onRequestClose={onRequestClose} ariaHideApp={false}
            style={{
                content: {
                    width: '400px',
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
                <Container>
                    { makeDirectoryList() }
                    <ButtonContainer>
                        <MoveFileButton onClick={moveFile}>
                            여기로 이동
                        </MoveFileButton>
                    </ButtonContainer>
                </Container>
            </ReactModal>
        )
    }
    return <></>
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const MoveFileButton = styled(Button)`
	background-color: ${(props) => props.theme.color.Primary};
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.3);
	color: white;
	padding: 10px;
	border: none;
	box-shadow: 3px 1px 3px grey;
	font-size: ${(props) => props.theme.fontSize.Content};
	float: 'right';
`;

const StyledDiv = styled.div`
    font-size: ${(props) => props.theme.fontSize.Content};
    padding: 10px 0px 10px 0px;
    &:hover {
        background-color: ${(props)=> props.theme.color.Line}
    } 
`;
export default MoveFileModal;