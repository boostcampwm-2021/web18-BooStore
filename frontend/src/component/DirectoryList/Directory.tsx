import React, { useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as OpenFolderSvg } from '../../asset/image/icons/icon_folder_empty.svg';
import { ReactComponent as FolderSvg } from '../../asset/image/icons/icon_folder.svg';
import { ReactComponent as ArrowBottomSvg } from '../../asset/image/icons/icon_arrow_bottom.svg';
import { ReactComponent as ArrowRightSvg } from '../../asset/image/icons/icon_left_arrow.svg';

interface Props {
	className?: string;
	name: string;
	isIncludeCurPath?: boolean;
	onClickNav?: React.MouseEventHandler<HTMLDivElement>;
}

const Directory: React.FC<Props> = ({
	className,
	name,
	children,
	isIncludeCurPath = false,
	onClickNav = () => {},
}) => {
	const [isChildrenOpen, setChildrenOpen] = useState(false);

	const onClickArrow = () => {
		setChildrenOpen((prev) => !prev);
	};

	return (
		<Container className={className}>
			<Content>
				{isChildrenOpen ? (
					<ArrowBottomSvg width={24} height={24} onClick={onClickArrow} />
				) : (
					<ArrowRightSvg width={24} height={24} onClick={onClickArrow} />
				)}
				<Nav onClick={onClickNav}>
					{isIncludeCurPath ? (
						<OpenFolderSvg width={36} height={36} />
					) : (
						<FolderSvg width={36} height={36} />
					)}
					<Name> {name} </Name>
				</Nav>
			</Content>
			{isChildrenOpen && <Children>{children}</Children>}
		</Container>
	);
};

const Container = styled.div``;
const Content = styled.div`
	height: 30px;
	display: flex;
	align-items: center;
`;
const Nav = styled.div`
	cursor: pointer;
	display: flex;
	align-items: center;
`;
const Name = styled.p``;
const Children = styled.div`
	padding-left: ${(props) => props.theme.padding.Content};
`;

export default Directory;
