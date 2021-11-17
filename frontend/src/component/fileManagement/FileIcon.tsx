import React from 'react';
import styled from 'styled-components';

import { ReactComponent as Folder } from '@asset/image/icons/icon_folder.svg';
import { ReactComponent as TextFile } from '@asset/image/icons/icon_text.svg';
import { ReactComponent as DefaultFile } from '@asset/image/icons/icon_file.svg';
import { ReactComponent as DocsFile } from '@asset/image/icons/icon_docs.svg';
import { ReactComponent as ImageFile } from '@asset/image/icons/icon_image.svg';
import { ReactComponent as VideoFile } from '@asset/image/icons/icon_video.svg';
import { ReactComponent as AudioFile } from '@asset/image/icons/icon_audio.svg';
import { ReactComponent as ZipFile } from '@asset/image/icons/icon_zip.svg';

interface Props {
	type: string;
}
const TypeIcon: React.FC<Props> = ({ type }) => {
	return (
		<IconDiv>
			{type.includes('folder') && <Folder />}
			{type.includes('text') && <TextFile />}
			{type.includes('image') && <ImageFile />}
			{type.includes('video') && <VideoFile />}
			{type.includes('audio') && <AudioFile />}
			{type.includes('zip') && <ZipFile />}
			{type.includes('pdf') && <DocsFile />}
			{type.includes('officedocument') && <DocsFile />}
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
