import React from 'react';
import styled from 'styled-components';
import { ReactComponent as Folder } from '../asset/image/icon_folder.svg';
import { ReactComponent as File } from '../asset/image/icon_file.svg';
import { ReactComponent as Image } from '../asset/image/icon_image.svg';
import { ReactComponent as Pdf } from '../asset/image/icon_pdf.svg';
import { ReactComponent as Zip } from '../asset/image/icon_zip.svg';
import { ReactComponent as Text } from '../asset/image/icon_text.svg';
interface Props {
	type: string;
}
const TypeIcon: React.FC<Props> = ({ type }) => {
	return (
		<IconDiv>
			{type.includes('folder') && <Folder style={{ width: '40px', height: '40px' }} />}
			{type.includes('text') && <Text style={{ width: '40px', height: '40px' }} />}
			{type.includes('image') && <Image style={{ width: '40px', height: '40px' }} />}
			{type.includes('pdf') && <Pdf style={{ width: '40px', height: '40px' }} />}
			{type.includes('zip') && <Zip style={{ width: '40px', height: '40px' }} />}
		</IconDiv>
	);
};

const IconDiv = styled.div`
	width: 60px;
	height: 60px;
	display: flex;
	justify-content: start;
	align-items: center;
`;

export default TypeIcon;
