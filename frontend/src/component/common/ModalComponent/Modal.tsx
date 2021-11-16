import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import { ModalType } from './type';

import Button from '../Button';
import ModalIcon from './ModalIcon';

interface Props {
	isOpen: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onCloseButton?: boolean;
	modalType?: ModalType;
}

const Modal: React.FC<Props> = ({
	onCloseButton = true,
	isOpen,
	setOpen,
	children,
	modalType = ModalType.Error,
}) => {
	const onRequestClose = useCallback(() => {
		if (onCloseButton) {
			setOpen(false);
		}
	}, [onCloseButton]);
	
	const getTitle = (modalType: ModalType) => {
		switch (modalType) {
			case ModalType.Share:
				return '링크 보기';
			case ModalType.Upload:
				return '진행 상황'
			case ModalType.Error:
			default:
				return '주의';
		}
	}

	return (
		<ReactModal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
			<Header>
				<ModalIcon modalType={modalType} />
				<Title> {getTitle(modalType)} </Title>
			</Header>
			<Content> {children} </Content>
			<FlexMiddleDiv>
				{onCloseButton && (
					<ModalButton onClick={() => setOpen(false)}> 확인 </ModalButton>
				)}
			</FlexMiddleDiv>
		</ReactModal>
	);
};

ReactModal.defaultStyles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(196, 196, 196, 0.5)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		width: '600px',
		minHeight: '275px',
		border: '1px solid #ccc',
		background: '#fff',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		borderRadius: '4px',
		outline: 'none',
		padding: '20px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
};

const Header = styled.div`
	display: flex;
	height: 45px;
	align-items: center;
`;
const Title = styled.p`
	font-size: ${(props) => props.theme.fontSize.Title};
	margin-left: 20px;
`;

const Content = styled.div`
	text-align: center;
`;

const FlexMiddleDiv = styled.div`
	display: flex;
	justify-content: center;
	align-items: end;
	
	height: 50px;
`;

const ModalButton = styled(Button)`
	background-color: ${(props) => props.theme.color.Primary};
	color: ${(props) => props.theme.color.PrimaryBG};
	padding: 10px;
`;

export default Modal;
