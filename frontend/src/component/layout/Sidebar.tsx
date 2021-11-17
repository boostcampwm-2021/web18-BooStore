import React from 'react';
import styled from 'styled-components';
import { Capacity } from '@model';
import { convertByteToUnitString } from '@util';
import ProgressBar from '@component/common/ProgressBar';
import DirectoryList from '@component/DirectoryList';
import { themeValue } from '@asset/style/theme';
import { FileDTO } from '@DTO';

import { ReactComponent as StarSvg } from '@asset/image/icons/icon_star.svg';
import { ReactComponent as TrashSvg } from '@asset/image/icons/icon_trash.svg';
import { Link } from 'react-router-dom';

const convertCapacityToString = (capacity: Capacity) => {
	const { currentCapacity, maxCapacity } = capacity;
	const currentCapacityString = convertByteToUnitString(currentCapacity);
	const maxCapacityString = convertByteToUnitString(maxCapacity);

	return `${maxCapacityString} 중 ${currentCapacityString} 사용`;
};

interface Props {
	capacity: Capacity;
	className?: string;
}

const Sidebar: React.FC<Props> = ({ capacity, className }) => {
	const { currentCapacity, maxCapacity } = capacity;
	const { Point: PointColor } = themeValue.color;

	return (
		<Container className={className}>
			<CapacityContainer>
				<CapacityBar value={currentCapacity} maxValue={maxCapacity} color={PointColor} />
				<ProgressValue>{`${convertCapacityToString(capacity)}`}</ProgressValue>
			</CapacityContainer>
			<DirectoryList/>
			<Footer>
				<FooterNav to="/star">
					<StarSvg />
					<span> 중요 문서함 </span>
				</FooterNav>
				<FooterNav to="/trash">
					<TrashSvg />
					<span> 휴지통 </span>
				</FooterNav>
			</Footer>
		</Container>
	);
};

const Container = styled.div`
	min-width: 250px;
	max-width: 300px;
	height: 100%;
	background-color: ${(props) => props.theme.color.PrimaryBG};
	border-right: 1px solid ${(props) => props.theme.color.Line};
	
	display: flex;
	flex-direction: column;
	
	color: ${(props) => props.theme.color.Content};
`;

const CapacityContainer = styled.div`
	padding: ${(props) => props.theme.padding.Content};
	padding-left: 30px;
	padding-right: 30px;

	display: flex;
	flex-direction: column;
	align-items: center;

	border-bottom: 1px solid ${(props) => props.theme.color.Line};
`;
const CapacityBar = styled(ProgressBar)`
	margin-bottom: 15px;
	width: 100%;
	height: 11px;
`;

const ProgressValue = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.fontSize.ContentSmall};
`;

const Footer = styled.div`
	display: flex;
	border-top: 1px solid ${(props) => props.theme.color.Line};
	
	width: 100%;
	height: 50px;
	margin-top: auto;
	
	> * {
		border-right: 1px solid ${(props) => props.theme.color.Line};
	}
	
	> *:last-child {
		border-right: none;
	}
`;

const FooterNav = styled(Link)`
	cursor: pointer;

	display: flex;
	width: 100%;
	height: 100%;
	padding: 0 15px;
	
	align-items: center;
	
	color: ${(props) => props.theme.color.Content};
    &:focus, &:hover, &:visited, &:link, &:active {
		color: ${(props) => props.theme.color.Content};
    }
	> *:first-child {
		margin-right: 10px;
	}
`;

export default Sidebar;
