import React, { Children } from 'react';
import styled from 'styled-components';
import LoginComponent from '../component/LoginComponent';
import { User } from '../model';

interface Props {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}


const LoginPage: React.FC<Props> = ({ setUser }) => {
	return (
		<LoginPageBackground>
			<LoginComponent setUser={setUser} />
		</LoginPageBackground>
	);
};

const LoginPageBackground = styled.div`
	width: 100%;
	height: 100vh;
	background-color: ${(props) => props.theme.color.PrimaryBG};
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default LoginPage;
