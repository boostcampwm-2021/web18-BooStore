import React, { useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as ExpandOnSvg } from '../asset/image/expand_more.svg';
import { ReactComponent as ExpandOffSvg } from '../asset/image/chevron_left.svg';
import { ReactComponent as StarSvg } from '../asset/image/star.svg';
import { Capacity } from '../model/capacity';
import { convertByteToGB, convertByteToMB, convertByteToKB } from '../util';
import ProgressBar from './ProgressBar';

interface Props {
	capacity: Capacity;
}

const convertCapacityToString = (capacity: Capacity) => {
	const { currentCapacity, maxCapacity } = capacity;
	const maxCapacityGB = `${convertByteToGB(maxCapacity).toFixed(2)}GB`;
	
	if (currentCapacity < 1024 * 1024) {
		return `${convertByteToKB(currentCapacity).toFixed(2)}KB / ${maxCapacityGB}`;
	}
	else if (currentCapacity < 1024 * 1024 * 1024) {
		return `${convertByteToMB(currentCapacity).toFixed(2)}MB / ${maxCapacityGB}`;
	}
	return `${convertByteToGB(currentCapacity).toFixed(2)}GB / ${maxCapacityGB}`;
}

const Sidebar: React.FC<Props> = ({ capacity }) => {
	const { currentCapacity, maxCapacity } = capacity;
	
	return (
		<Container>
			<CapacityContainer>
				<ProgressBar value={currentCapacity} maxValue={maxCapacity} />
				<ProgressValue>{`${convertCapacityToString(capacity)}`}</ProgressValue>
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
