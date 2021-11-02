import React, { useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as ExpandOnSvg } from '../asset/image/expand_more.svg';
import { ReactComponent as ExpandOffSvg } from '../asset/image/chevron_left.svg';
import { ReactComponent as StarSvg } from '../asset/image/star.svg';

interface Props {
	currentCapacity: number;
	maxCapacity: number;
}

const Sidebar: React.FC<Props> = ({ currentCapacity, maxCapacity }) => {
	return (
		<Container>
			<CapacityContainer>
				<ProgressBar>
					<Progress percent={(currentCapacity / maxCapacity) * 100} />
				</ProgressBar>
				<ProgressValue>{`${currentCapacity}Byte / ${maxCapacity}Byte`}</ProgressValue>
			</CapacityContainer>
			<NavBar>
				{/* 추후 Link로 변경하면 될듯 */}
				<NavBox>
					<Nav> 내 디렉토리 </Nav>
					<ExpandOnSvg />
				</NavBox>
				<NavBox>
					<Nav> 중요 문서함 </Nav>
					<StarSvg />
				</NavBox>
				<NavBox>
					<Nav> 휴지통 </Nav>
				</NavBox>
			</NavBar>
		</Container>
	);
};

const Container = styled.div`
	width: 300px;
	height: 100%;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	border-right: 1px solid ${(props) => props.theme.color.Line};

	padding: 25px;
`;

const CapacityContainer = styled.div`
	margin-bottom: 50px;
`;

const ProgressBar = styled.div`
	background-color: #c4c4c4;
	height: 6px;

	border-radius: 10px;
	margin-bottom: 8px;
`;
const Progress = styled.div<{ percent: number }>`
	background-color: ${(props) => props.theme.color.Primary};
	height: 6px;
	width: ${(props) => `${props.percent}%`};

	border-radius: 10px;
`;
const ProgressValue = styled.p`
	margin: 0;
	font-weight: bold;
`;

const NavBar = styled.nav``;
const NavBox = styled.div`
	margin: 10px 0;

	display: flex;
	align-items: center;
`;
const Nav = styled.p`
	font-size: 24px;
	margin: 0;
	margin-right: 10px;

	cursor: pointer;
`;

export default React.memo(Sidebar);
