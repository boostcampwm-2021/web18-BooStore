import React, { Children } from 'react';
import styled from 'styled-components';
import LoginComponent from '../component/LoginComponent';

interface Props {}

const LoginPage: React.FC<Props> = () => {
	return (
		<LoginPageBackground>
			<LoginComponent />
		</LoginPageBackground>
	);
};

const LoginPageBackground = styled.div`
	width: 100%;
	height: 100vh;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default LoginPage;
