import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import FileList from '../component/fileManagement/FileList';

import FileMenu from '../component/fileManagement/FileMenu';
import Sidebar from '../component/layout/Sidebar';
import { User } from '../model';
import { Capacity } from '../model';
import folderup from '../asset/image/folderup.svg';
import { FileDTO } from '../DTO';
import { getFiles } from '../util';

interface Props {
	user: User;
}

const MainPage: React.FC<Props> = () => {
	const [currentDir, setCurrentDir] = useState('/');
	const [capacity, setCapacity] = useState<Capacity>({ currentCapacity: 0, maxCapacity: 1024 });
	const [files, setFiles] = useState<FileDTO[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<FileDTO[]>([]);
	const [tempUpload, setTempUpload] = useState(false);
	const [isAscending, setIsAscending] = useState<boolean>(true);

	const parentDir = (currentDirectory: string) => {
		let parentDir = currentDirectory.split('/').slice(0, -1).join('/');
		parentDir === '' ? (parentDir = '/') : '';
		return parentDir;
	};

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

	const onClickParentButton = async () => {
		const files = await getFiles(parentDir(currentDir), isAscending);
		setFiles(files);
		setCurrentDir(parentDir(currentDir));
		setSelectedFiles([]);
	};

	useEffect(() => {
		const callFile = async () => {
			setFiles(await getFiles(currentDir, isAscending));
		};
		callFile();
		getCapacity();
	}, [tempUpload, isAscending]);

	return (
		<Container>
			<SidebarForMain capacity={capacity} files={files} />
			<InnerContainer>
				<Directory>
					{currentDir === '/' ? (
						<ParentButton src={folderup} style={{ opacity: 0.5 }}></ParentButton>
					) : (
						<ParentButton src={folderup} onClick={onClickParentButton}></ParentButton>
					)}
					{`내 디렉토리${currentDir === '/' ? '' : currentDir.split('/').join(' > ')}`}
				</Directory>
				<FileMenu
					showShareButton
					capacity={capacity}
					setCapacity={setCapacity}
					selectedFiles={selectedFiles}
					currentDir={currentDir}
					setTempUpload={setTempUpload}
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

const Directory = styled.p`
	font-size: 24px;
	border-bottom: 2px solid ${(props) => props.theme.color.Line};

	margin: 0;
`;

const ParentButton = styled.img`
	width: 20px;
	height: 20px;
`;

export default MainPage;
