import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import FileList from '../component/FileList';

import FileMenu from '../component/FileMenu';
import Sidebar from '../component/Sidebar';
import { User } from '../model';
import { Capacity } from '../model/capacity';
import folderup from '../asset/image/folderup.svg';
import { FileDTO } from '../DTO';

interface Props {
	user: User;
}

const MainPage: React.FC<Props> = () => {
	const [currentDir, setCurrentDir] = useState('/depth0/depth1/depth2/depth3');
	const [capacity, setCapacity] = useState<Capacity>({ currentCapacity: 0, maxCapacity: 1024 });

	const parentDir = (currentDirectory: string) => {
		let parentDir = currentDirectory.split('/').slice(0, -1).join('/');
		parentDir === '' ? (parentDir = '/') : '';
		// console.log('parent: ', parentDir);
		return parentDir;
	};

	const getFiles = async (directory: string) => {
		// console.log('current :', currentDir);
		return await fetch('/user/files?path=' + directory, {
			credentials: 'include',
		})
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				// console.log(data);
				setFiles(data);
			});
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

	const onClickParentButton = () => {
		getFiles(parentDir(currentDir));
		setCurrentDir(parentDir(currentDir));
	};

	const [files, setFiles] = useState<FileDTO[]>(
		/*[
		{
			id: '111',
			contentType: 'image/jpeg',
			name: 'testFileName',
			createdAt: '2020.02.02',
			updatedAt: '2021.02.03',
			size: 1024,
			ownerId: 'test1',
		},
		{
			id: '132',
			contentType: 'txt',
			name: 'testFile22',
			createdAt: '2020.02.03',
			updatedAt: '2020.02.03',
			size: 512,
			ownerId: 'test1',
		},
	]*/ []
	);

	useEffect(() => {
		getFiles(currentDir);
		getCapacity();
	}, []);

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
					<FileMenu showShareButton capacity={capacity} setCapacity={setCapacity} />
					<FileList files={files} setFiles={setFiles} />
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
