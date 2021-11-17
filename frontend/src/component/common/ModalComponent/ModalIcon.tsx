import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { ModalType } from './type';

import { ReactComponent as ProgressIcon } from '@asset/image/icons/icon_progress.svg';
import { ReactComponent as ErrorIcon } from '@asset/image/icons/icon_warning.svg';
import { ReactComponent as ShareIcon } from '@asset/image/icons/icon_share.svg';

interface Props {
	modalType: ModalType;
}
const ModalIcon: React.FC<Props> = ({ modalType }) => {
	switch (modalType) {
		case ModalType.Error:
			return <ErrorIcon />;
		case ModalType.Share:
			return <ShareIcon />;
		case ModalType.Upload:
			return <ProgressIcon />;
		default:
			return <ErrorIcon />;
	}
};

export default ModalIcon;
