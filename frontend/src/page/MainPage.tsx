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
		const files = await getFiles(parentDir(currentDir));
		setFiles(files);
		setCurrentDir(parentDir(currentDir));
		setSelectedFiles([]);
	};

	useEffect(() => {
		const callFile = async () => {
			setFiles(await getFiles(currentDir));
		};
		callFile();
		getCapacity();
	}, [tempUpload]);

	return (
		<Container>
			<Sidebar capacity={capacity} />
			<InnerContainer>
				<Directory>
					{currentDir === '/' ? (
						<ParentButton src={folderup} style={{ opacity: 0.5 }}></ParentButton>
					) : (
						<ParentButton src={folderup} onClick={onClickParentButton}></ParentButton>
					)}
					{`내 디렉토리${currentDir === '/' ? '' : currentDir.split('/').join(' > ')}`}
				</Directory>
				<Section>
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
					/>
				</Section>
			</InnerContainer>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	height: calc(100vh - ${(props) => props.theme.HeaderHeight});
`;

const InnerContainer = styled.div`
	background-color: ${(props) => props.theme.color.PrimaryBG};
	padding: 25px 35px;
	width: 100%;
`;

const Directory = styled.p`
	font-size: 24px;
	border-bottom: 2px solid ${(props) => props.theme.color.Line};

	margin: 0;
	padding-bottom: 20px;
`;

const Section = styled.section`
	padding: 10px;
`;

const ParentButton = styled.img`
	width: 20px;
	height: 20px;
`;

export default MainPage;
