import React,{ useState } from 'react';
import styled from 'styled-components';
import { FileDTO } from '@DTO';

import Directory from './Directory';

import { getDirectoryList } from '../../api'; 

interface Props {
	className?: string;
}

const directories = getDirectoryList();
const makeDirectoryTree = (directories: Set<string>) =>{

}


const DirectoryList: React.FC<Props> = ({ className }) => {

	getDirectoryList();

	return (
		<Container className={className}>
			<Directory name={"내 스토어"} isIncludeCurPath={true} >
				<Directory name={"Folder"} isIncludeCurPath={true} />
				<Directory name={"Folder22"} />
			</Directory>
		</Container>
	);
};

const Container = styled.div`
	padding: ${(props) => props.theme.padding.Content};
`;

export default DirectoryList;
