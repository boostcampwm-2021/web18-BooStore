import React, { Key, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import FileList from '../component/fileManagement/FileList';

import FileMenu from '../component/fileManagement/FileMenu';
import Sidebar from '../component/layout/Sidebar';
import { User } from '../model';
import { Capacity } from '../model';
import { FileDTO } from '../DTO';
import { getFiles } from '../util';

import arrow from '../asset/image/icons/icon_left_arrow.svg';

interface Props {
	user: User;
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
	relativePath === '' ? (relativePath = '/') : '';

	return (
		<>
			{idx != 0 ? <img src={arrow} style={{ verticalAlign: 'middle' }}></img> : ''}
			<span onClick={() => onClickDirectory(relativePath)} style={{ cursor: 'pointer' }}>
				{name}
			</span>
		</>
	);
};

const MainPage: React.FC<Props> = () => {
	const [currentDir, setCurrentDir] = useState('/');
	const [capacity, setCapacity] = useState<Capacity>({ currentCapacity: 0, maxCapacity: 1024 });
	const [files, setFiles] = useState<FileDTO[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<FileDTO[]>([]);
	const [isAscending, setIsAscending] = useState<boolean>(true);

	const getCapacity = async () => {
		await fetch('/user/capacity', {
			credentials: 'include',
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error('something wrong');
				}
			})
			.then((data) => {
				setCapacity(data);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const onClickDirectory = async (relativePath: string) => {
		const files = await getFiles(relativePath, isAscending);
		setFiles(files);
		setCurrentDir(relativePath);
		setSelectedFiles([]);
	};

	const updateFiles = async () => {
		setFiles(await getFiles(currentDir, isAscending));
		getCapacity();
	}
	
	useEffect(() => {
		updateFiles();
	}, [isAscending]);
	const temp = currentDir.split('/').slice(1).join('/');

	return (
		<Container>
			<SidebarForMain capacity={capacity} files={files} />
			<InnerContainer>
				<DirectorySection>
					<Directory
						idx={0}
						name={'내 스토어'}
						currentDir={currentDir}
						onClickDirectory={onClickDirectory}
						key={0}
					/>
					{temp != ''
						? temp
								.split('/')
								.map((el, idx) => (
									<Directory
										idx={idx + 1}
										name={el}
										currentDir={currentDir}
										onClickDirectory={onClickDirectory}
										key={idx + 1}
									/>
								))
						: ''}
				</DirectorySection>
				<FileMenu
					showShareButton
					capacity={capacity}
					setCapacity={setCapacity}
					selectedFiles={selectedFiles}
					setSelectedFiles={setSelectedFiles}
					currentDir={currentDir}
					setFiles={setFiles}
					updateFiles={updateFiles}
				/>
				<FileList
					files={files}
					setSelectedFiles={setSelectedFiles}
					setFiles={setFiles}
					setCurrentDir={setCurrentDir}
					currentDirectory={currentDir}
					isAscending={isAscending}
					setIsAscending={setIsAscending}
				/>
			</InnerContainer>
		</Container>
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

export default MainPage;
