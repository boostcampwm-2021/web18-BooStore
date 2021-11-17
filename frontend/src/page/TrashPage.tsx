import React, { Key, useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import FileList from '@component/fileManagement/FileList';
import FileMenu from '@component/fileManagement/FileMenuForTrash';
import Sidebar from '@component/layout/Sidebar';
import { User } from '@model';
import { Capacity } from '@model';
import { FileDTO } from '@DTO';
import { getFiles } from '@util';
import { getCapacity } from '@api';

interface TrashPageProps {
	user: User;
}

const TrashPage: React.FC<TrashPageProps> = () => {
	const [currentDir, setCurrentDir] = useState('/');
	const [capacity, setCapacity] = useState<Capacity>({ currentCapacity: 0, maxCapacity: 1024 * 1024 * 1024 });
	const [files, setFiles] = useState<FileDTO[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<FileDTO[]>([]);
	const [isAscending, setIsAscending] = useState<boolean>(true);

	const updateFiles = async () => {
		setFiles(await getFiles(currentDir, isAscending, true));
		setCapacity(await getCapacity());
	};

	useEffect(() => {
		updateFiles();
	}, [isAscending]);

	return (
		<Container>
			<SidebarForMain capacity={capacity} files={files} />
			<InnerContainer>
				<DirectorySection>
					휴지통
				</DirectorySection>
				<FileMenu
					setCapacity={setCapacity}
					selectedFiles={selectedFiles}
					setSelectedFiles={setSelectedFiles}
					setFiles={setFiles}
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

export default TrashPage;
