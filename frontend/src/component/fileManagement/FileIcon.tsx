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
const FileIcon: React.FC<Props> = ({ type }) => {
	const getIcon = () => {
		if (type.includes('folder')) {
			return <Folder />;
		} else if (type.includes('text')) {
			return <TextFile />;
		} else if (type.includes('image')) {
			return <ImageFile />;
		} else if (type.includes('video')) {
			return <VideoFile />;
		} else if (type.includes('audio')) {
			return <AudioFile />;
		} else if (type.includes('zip')) {
			return <ZipFile />;
		} else if (type.includes('pdf')) {
			return <DocsFile />;
		} else if (type.includes('officedocument')) {
			return <DocsFile />;
		} else {
			return <DefaultFile />;
		}
	};

	return <IconDiv>{getIcon()}</IconDiv>;
};

const IconDiv = styled.div`
	width: 60px;
	height: 60px;
	display: flex;
	justify-content: start;
	align-items: center;
`;

export default FileIcon;
