import React from 'react';
import styled from 'styled-components';
import { FileDTO } from '@DTO';

import Directory from './Directory';

interface Props {
	files: FileDTO[];
	className?: string;
}

const DirectoryList: React.FC<Props> = ({ className, files }) => {
	// files써서 디렉토리 리스트 만들면 될듯하네요...
	
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
