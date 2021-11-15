import React, { useState } from 'react';
import styled from 'styled-components';

interface Props {
	value: number;
	maxValue: number;
}

const ProgressBar: React.FC<Props> = ({ value, maxValue }) => {
	return (
		<Background>
			<Progress percent={(value / maxValue) * 100} />
		</Background>
	);
};

const Background = styled.div`
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

export default ProgressBar;
