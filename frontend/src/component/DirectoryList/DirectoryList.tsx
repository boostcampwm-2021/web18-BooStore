import React, { Fragment, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FileDTO } from '@DTO';

import Directory from './Directory';

import { getDirectoryList } from 'api';
import { makeTree, treeNode } from '@util';
import { User } from '@model';
import { useHistory } from 'react-router';

const makeDirectoryTree = (directories: string[]) => {
	const splitDirectories: Array<string[]> = [];
	directories.forEach((el) => {
		splitDirectories.push(el.split('/'));
	});
	splitDirectories.sort((a: string[], b: string[]) => {
		if (a.length > b.length) return 1;
		else if (a.length === b.length) return 0;
		else return -1;
	});
	return makeTree(splitDirectories);
};

interface Props {
	className?: string;
	files: FileDTO[];
	setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
}

const DirectoryList: React.FC<Props> = ({ className, files, setCurrentDir }) => {
	const [folderStructure, setFolderStructure] = useState({
		relativeDirectory: '/',
		parentDirectory: '',
		children: new Map(),
	});
	const history = useHistory();

	const makeFolderStructure = async () => {
		const directories = await getDirectoryList();
		return makeDirectoryTree(directories);
	};

	useEffect(() => {
		const handleFolderStructure = async () => {
			setFolderStructure(await makeFolderStructure());
		};
		handleFolderStructure();
	}, [files]);

	const getFolderStructure = (treeNode: treeNode) => {
		const childrenToArr = Array.from(treeNode.children.values());
		let curDir = treeNode.relativeDirectory.split('/').splice(-1)[0];
		if (curDir === '') {
			curDir = '내 스토어';
		}

		const onClickNav = () => {
			history.push('/', {
				currentDirectory: treeNode.relativeDirectory,
			});
			setCurrentDir(treeNode.relativeDirectory);
		};

		return (
			<Directory name={curDir} onClickNav={onClickNav}>
				{childrenToArr.map((treeNode: treeNode) => {
					return (
						<Fragment key={treeNode.relativeDirectory}>
							{getFolderStructure(treeNode)}
						</Fragment>
					);
				})}
			</Directory>
		);
	};
	return <Container className={className}>{getFolderStructure(folderStructure)}</Container>;
};

const Container = styled.div`
	padding: ${(props) => props.theme.padding.Content};
`;

export default DirectoryList;
