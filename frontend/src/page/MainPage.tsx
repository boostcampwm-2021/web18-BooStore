import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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

const MainPage: React.FC<Props> = () => {
	const [currentDir, setCurrentDir] = useState('/test1/test2/');
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

	const temp = currentDir.split('/').slice(1,-1).join('/');

	return (
		<Container>
			<SidebarForMain capacity={capacity} files={files} />
			<InnerContainer>
				<DirectorySection>
					<span>내 스토어</span>
						{
						temp.split('/').map((el,idx) => (
							<Directory key={idx}>
								<img src={ arrow } style={{verticalAlign:"middle"}}></img>
								<span>{el}</span>
							</Directory>))
						}
				</DirectorySection>
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
>>>>>>> d756baa ([Feat] 현재 디렉토리 출력)
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
	padding: ${(props) => props.theme.padding.Content}
	`;

const Directory = styled.span`
	line-height: 18px;
	padding: 20px 0px 20px 0px;
`;

const Section = styled.section`
	padding: 10px;
`;

const ParentButton = styled.img`
	width: 20px;
	height: 20px;
`;

export default MainPage;
