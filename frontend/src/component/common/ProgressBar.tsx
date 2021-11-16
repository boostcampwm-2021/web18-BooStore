import React, { useState } from 'react';
import styled from 'styled-components';

interface Props {
	value: number;
	maxValue: number;
	color?: string;
	backgroundColor?: string;
	className?: string;
}

const ProgressBar: React.FC<Props> = ({
	value,
	maxValue,
	color = '#084A83',
	backgroundColor = '#D7D7D7',
	className
}) => {
	return (
		<Background backgroundColor={backgroundColor} className={className}>
			<Progress percent={(value / maxValue) * 100} backgroundColor={color}/>
		</Background>
	);
};

const Background = styled.div<{ backgroundColor: string }>`
	background-color: ${(props) => props.backgroundColor};
	height: 8px;

	border-radius: 30px;
`;
const Progress = styled.div<{ percent: number, backgroundColor: string }>`
	background-color: ${(props) => props.backgroundColor};
	height: 100%;
	width: ${(props) => `${props.percent}%`};

	border-right: 2px solid white;
	border-radius: 30px;
`;

export default ProgressBar;
