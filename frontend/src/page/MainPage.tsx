import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import FileList from '../component/FileList';

import FileMenu from '../component/FileMenu';
import Sidebar from '../component/Sidebar';
import { User } from '../model';
import { Capacity } from '../model/capacity';

interface Props {
	user: User
}

const MainPage: React.FC<Props> = () => {
	const [files, setFiles] = useState([
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
	]);
	const [currentDir, setCurrentDir] = useState('/');
	const [capacity, setCapacity] = useState<Capacity>({currentCapacity: 0, maxCapacity: 1024});
	
	useEffect(() => {
		fetch('/user/capacity', {
			credentials: 'include',
		})
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
			else {
				throw new Error('something wrong');
			}
		})
		.then((data) => {
			setCapacity(data);
		})
		.catch((err) => {
			console.error(err);
		})
	}, []);

	return (
		<Container>
			<Sidebar capacity={capacity} />
			<InnerContainer>
				<Directory>
					{`내 디렉토리${currentDir === '/' ? '' : currentDir.split('/').join(' > ')}`}
				</Directory>
				<Section>
					<FileMenu showShareButton />
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

export default MainPage;
