import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import FileList from '@component/fileManagement/FileListForStar';
import FileMenu from '@component/fileManagement/FileMenuForStar';
import Sidebar from '@component/layout/Sidebar';
import Header from '@component/layout/Header';
import { User } from '@model';
import { Capacity } from '@model';
import { FileDTO } from '@DTO';
import { getFiles, getAllStarFiles } from '@util';
import { getCapacity } from 'api';

import arrow from '@asset/image/icons/icon_left_arrow.svg';

interface StarPageProps {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface DirectoryProps {
	idx: number;
	name: string;
	currentDir: string;
	onClickDirectory: (relativePath: string) => Promise<void>;
}

const StarPage: React.FC<StarPageProps> = ({ user, setUser }) => {
	const [currentDir, setCurrentDir] = useState('/');
	const [capacity, setCapacity] = useState<Capacity>({
		currentCapacity: 0,
		maxCapacity: 1024 * 1024 * 1024,
	});
	const [files, setFiles] = useState<FileDTO[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<Map<string, FileDTO>>(new Map());
	const [isAscending, setIsAscending] = useState<boolean>(true);

	const onClickDirectory = async (relativePath: string) => {
		if (relativePath === '/') {
			const files = await getAllStarFiles(relativePath, isAscending);
			setFiles(files);
		} else {
			const files = await getFiles(relativePath, isAscending, false, false);
			setFiles(files);
		}
		setSelectedFiles(new Map());
		setCurrentDir(relativePath);
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

	const updateFiles = async () => {
		setSelectedFiles(new Map());
		if (currentDir === '/') {
			setFiles(await getAllStarFiles(currentDir, isAscending));
		} else {
			setFiles(await getFiles(currentDir, isAscending, false));
		}
		setCapacity(await getCapacity());
	};

	useEffect(() => {
		updateFiles();
	}, [currentDir, isAscending]);

	return (
		<>
			<Header user={user} setUser={setUser} setCurrentDir={setCurrentDir} />
			<Container>
				<SidebarForTrash capacity={capacity} files={files} setCurrentDir={setCurrentDir} />
				<InnerContainer>
					<DirectorySection>
						<Directory
							idx={0}
							name={'중요 문서함'}
							currentDir={currentDir}
							onClickDirectory={onClickDirectory}
							key={0}
						/>
						{getCurDirectoryComponent()}
					</DirectorySection>
					<FileMenu
						selectedFiles={selectedFiles}
						setSelectedFiles={setSelectedFiles}
						files={files}
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
					/>
				</InnerContainer>
			</Container>
		</>
	);
};

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
			{idx != 0 && <img src={arrow} style={{ verticalAlign: 'middle' }}></img>}
			<span onClick={() => onClickDirectory(relativePath)} style={{ cursor: 'pointer' }}>
				{name}
			</span>
		</>
	);
};

const Container = styled.div`
	display: flex;
	height: calc(100vh - ${(props) => props.theme.HeaderHeight});
	overflow-y: hidden;
`;

const SidebarForTrash = styled(Sidebar)`
	flex: 1;
`;

const InnerContainer = styled.div`
	flex: 4;
	background-color: ${(props) => props.theme.color.PrimaryBG};
	height: 100%;
	overflow-y: hidden;
	min-width: 1000px;

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

export default StarPage;
