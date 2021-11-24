import React, { Key, useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import FileList from '@component/fileManagement/FileList';
import FileMenu from '@component/fileManagement/FileMenuForMain';
import Sidebar from '@component/layout/Sidebar';
import Header from '@component/layout/Header';
import ContextMenu from '@component/common/ContextMenu';
import NewFolderModal from '@component/fileManagement/NewFolderModal';
import MoveFileModal from '@component/fileManagement/MoveFileModal';
import { User } from '@model';
import { Capacity } from '@model';
import { FileDTO } from '@DTO';
import { getFiles } from '@util';
import { getCapacity } from 'api';

import { ReactComponent as ArrowSvg } from '@asset/image/icons/icon_left_arrow.svg';
import { useLocation } from 'react-router';

interface MainPageProps {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface DirectoryProps {
	idx: number;
	name: string;
	currentDir: string;
	onClickDirectory: (relativePath: string) => Promise<void>;
}

const Directory: React.FC<DirectoryProps> = ({ idx, name, currentDir, onClickDirectory }) => {
	let relativePath: string = currentDir
		.split('/')
		.slice(0, idx + 1)
		.join('/');
	if (relativePath === '') {
		relativePath = '/';
	}

	return (
		<>
			{idx != 0 && <ArrowSvg style={{ verticalAlign: 'middle' }} />}
			<span onClick={() => onClickDirectory(relativePath)} style={{ cursor: 'pointer' }}>
				{name}
			</span>
		</>
	);
};

const MainPage: React.FC<MainPageProps> = ({ user, setUser }) => {
	const [currentDir, setCurrentDir] = useState('/');
	const [capacity, setCapacity] = useState<Capacity>({
		currentCapacity: 0,
		maxCapacity: 1024 * 1024 * 10,
	});
	const [files, setFiles] = useState<FileDTO[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<Map<string, FileDTO>>(new Map());
	const [isAscending, setIsAscending] = useState<boolean>(true);
	const location = useLocation<{ currentDirectory: string | undefined }>();
	
	const onClickDirectory = async (relativePath: string) => {
		const files = await getFiles(relativePath, isAscending);
		setFiles(files);
		setCurrentDir(relativePath);
		setSelectedFiles(new Map());
	};

	const updateFiles = async () => {
		setSelectedFiles(new Map());
		setFiles(await getFiles(currentDir, isAscending));
		setCapacity(await getCapacity());
	};

	const getCurDirectoryComponent = useCallback(() => {
		if (currentDir === '/') {
			return;
		}
		return currentDir
			.split('/')
			.slice(1)
			.map((el, idx) => (
				<Directory
					idx={idx + 1}
					name={el}
					currentDir={currentDir}
					onClickDirectory={onClickDirectory}
					key={idx + 1}
				/>
			));
	}, [currentDir]);

	useEffect(() => {
		updateFiles();
	}, [currentDir, isAscending]);
	useEffect(() => {
		const currentDirectory = location.state?.currentDirectory;
		setCurrentDir(currentDirectory ?? '/');
	}, []);

	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);

	const handleContextMenu = useCallback(
		(event) => {
			event.preventDefault();
			setAnchorPoint({ x: event.pageX, y: event.pageY });
			setShow(true);
		},
		[setShow, setAnchorPoint]
	);

	const handleClick = useCallback(() => (show ? setShow(false) : null), [show]);

	const [isOpenNewFolder, setIsOpenNewFolder] = useState(false);
	const [isOpenMoveFile, setIsOpenMoveFile] = useState(false);

	return (
		<>
			<Header user={user} setUser={setUser} setCurrentDir={setCurrentDir} />
			<Container>
				<SidebarForMain capacity={capacity} files={files} setCurrentDir={setCurrentDir} />
				<InnerContainer onClick={handleClick} onContextMenu={handleContextMenu}>
					<DirectorySection>
						<Directory
							idx={0}
							name={'내 스토어'}
							currentDir={currentDir}
							onClickDirectory={onClickDirectory}
							key={0}
						/>
						{getCurDirectoryComponent()}
					</DirectorySection>
					<FileMenu
						showShareButton
						capacity={capacity}
						setCapacity={setCapacity}
						selectedFiles={selectedFiles}
						setSelectedFiles={setSelectedFiles}
						currentDir={currentDir}
						setFiles={setFiles}
						files={files}
						updateFiles={updateFiles}
					/>
					<StyledFileList
						files={files}
						setFiles={setFiles}
						selectedFiles={selectedFiles}
						setSelectedFiles={setSelectedFiles}
						setCurrentDir={setCurrentDir}
						currentDirectory={currentDir}
						isAscending={isAscending}
						setIsAscending={setIsAscending}
						updateFiles={updateFiles}
					/>
					<ContextMenu 
						setIsOpenNewFolder={setIsOpenNewFolder} 
						setIsOpenMoveFile={setIsOpenMoveFile}
						show={show}
						anchorPoint={anchorPoint}
						selectedFiles={selectedFiles}
					/>
					<NewFolderModal
						isOpenNewFolder={isOpenNewFolder}
						setIsOpenNewFolder={setIsOpenNewFolder}
						setFiles={setFiles}
						files={files}
						curDir={currentDir}
					/>
					<MoveFileModal 
						selectedFiles={selectedFiles}
						isOpenMoveFile={isOpenMoveFile} 
						setIsOpenMoveFile={setIsOpenMoveFile}
						curDir={currentDir}
						setFiles={setFiles}
					/>
				</InnerContainer>
			</Container>
		</>
	);
};

const Container = styled.div`
	display: flex;
	height: calc(100vh - ${(props) => props.theme.HeaderHeight});
	overflow-y: hidden;
`;

const SidebarForMain = styled(Sidebar)`
	flex: 1;
`;

const InnerContainer = styled.div`
	flex: 4;
	background-color: ${(props) => props.theme.color.PrimaryBG};
	height: 100%;
	overflow-y: hidden;

	display: flex;
	flex-direction: column;
`;

const DirectorySection = styled.div`
	font-family: ${(props) => props.theme.FontFamily.Medium};
	font-size: ${(props) => props.theme.fontSize.Title};
	border-bottom: 1px solid ${(props) => props.theme.color.Line};
	padding: ${(props) => props.theme.padding.Content};
`;
const StyledFileList = styled(FileList)`
	flex: 1;
`;

export default MainPage;
