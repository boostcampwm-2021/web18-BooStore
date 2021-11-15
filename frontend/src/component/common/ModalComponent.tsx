import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';

interface Props {
	isOpen: boolean;
	setToggleModal: React.Dispatch<React.SetStateAction<boolean>>;
	onCloseButton?: boolean;
}

const ModalComponent: React.FC<Props> = ({
	onCloseButton = true,
	isOpen,
	setToggleModal,
	children,
}) => {

	if (onCloseButton) {
		return (
			<Modal isOpen={isOpen} onRequestClose={() => setToggleModal(false)} ariaHideApp={false}>
				<ModalContent> {children} </ModalContent>
				<FlexMiddleDiv>
					<ModalButton onClick={() => setToggleModal(false)}>Close</ModalButton>
				</FlexMiddleDiv>
			</Modal>
			);
	}
	else {
		return (
			<Modal isOpen={isOpen} ariaHideApp={false}>
				<ModalContent> {children} </ModalContent>
			</Modal>
		);
	}
};

const FlexMiddleDiv = styled.div`
	display: flex;
	justify-content: center;
`;

Modal.defaultStyles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.75)',
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		position: 'absolute',
		width: '400px',
		minHeight: '200px',
		border: '1px solid #ccc',
		background: '#fff',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		borderRadius: '4px',
		outline: 'none',
		padding: '30px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
};

const ModalContent = styled.div`
	overflow-x: hidden;
`;

const ModalButton = styled.div`
	background-color: ${(props) => props.theme.color.Primary};
	border: none;
	border-radius: 6px;
	color: ${(props) => props.theme.color.PrimaryBG};
	font-size: 12px;
	padding: 10px;
`;

export default ModalComponent;
