import React,{ useState } from 'react';
import styled from 'styled-components';
import { FileDTO } from '@DTO';

import Directory from './Directory';

import { getDirectoryList } from '../../api'; 
import { makeTree } from '@util';

const makeDirectoryTree = (directories: string[]) =>{
	const splitDirectories: Array<string[]> = []; 
	directories.forEach(el => {
		splitDirectories.push(el.split('/'));
	});
	splitDirectories.sort((a: string[], b: string[])=>{
		if(a.length > b.length) return 1;
		else if(a.length === b.length) return 0;
		else return -1;
	})
	makeTree(splitDirectories);
}

interface Props {
	className?: string;
}

const DirectoryList: React.FC<Props> = ({ className }) => {

	
	//const tree = makeDirectoryTree(directories);
	
	const makeTree = async()=>{
		const directories = await getDirectoryList();
		const tree = makeDirectoryTree(directories);
	}
	makeTree();

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
