import React, { Children } from 'react';
import styled from 'styled-components';
import LoginComponent from '../component/LoginComponent';

type LoginPageProps = {
	children: React.ReactNode;
};

function LoginPage({ children }: LoginPageProps) {
	return (
		<LoginPageBackground>
			<LoginComponent />
		</LoginPageBackground>
	);
}

const LoginPageBackground = styled.div`
	width: 100%;
	height: 100vh;
	background-color: ${(props) => props.theme.color.SecondaryBG};
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default LoginPage;
