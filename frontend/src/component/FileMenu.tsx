import React, { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';

import { ReactComponent as ToggleOffSvg } from '../asset/image/check_box_outline_blank.svg';
import { ReactComponent as ToggleOnSvg } from '../asset/image/check_box_outline_selected.svg';

interface Props {
	showShareButton?: boolean;
}

const FileMenu: React.FC<Props> = ({ showShareButton }) => {
	return (
		<Container>
			<SelectAllBtn>
				<ToggleOffSvg />
			</SelectAllBtn>
			<ActButton> 올리기 </ActButton>
			{!showShareButton || <ShareButton> 공유하기 </ShareButton>}
		</Container>
	);
};

const Container = styled.div`
	padding: 15px 20px;
	border-bottom: 1px solid ${(props) => props.theme.color.Line};

	display: flex;
`;

const SelectAllBtn = styled.button`
	cursor: pointer;

	padding: 0;
	margin-right: 20px;

	display: flex;
	justify-content: center;
	align-items: center;
`;

const ActButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;
`;

const ShareButton = styled.button`
	cursor: pointer;
	outline: none;
	border: 1px solid ${(props) => props.theme.color.Line};
	border-radius: 5px;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	width: 150px;

	margin-left: auto;
`;

export default React.memo(FileMenu);
