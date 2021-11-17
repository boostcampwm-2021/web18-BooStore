import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { User } from '@model';
import Modal from 'react-modal';
import { ModalButton } from './SignupComponent';

import { ReactComponent as Account } from '@asset/image/icons/icon_login_user.svg';
import { ReactComponent as Password } from '@asset/image/icons/icon_login_password.svg';
import { ReactComponent as Logo } from '@asset/image/icons/logo_big.svg';

interface Props {
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const LoginComponent: React.FC<Props> = ({ setUser }) => {
	interface Inputs {
		id: string;
		password: string;
	}

	const history = useHistory();

	const [inputs, setInputs] = useState<Inputs>({ id: '', password: '' });
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [modalText, setModalText] = useState('유효하지 않은 아이디 또는 비밀번호 입니다.');

	const { id, password } = inputs;

	const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		const { value, name } = target;
		setInputs({
			...inputs,
			[name]: value,
		});
	};

	const onReset = () => {
		setInputs({
			id: '',
			password: '',
		});
	};

	const onClickLogin = () => {
		fetch(`/login`, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify(inputs),
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error(response.status.toString());
				}
			})
			.then((data) => {
				localStorage.setItem('user', JSON.stringify(data));
				setUser({ ...data });
				history.push({
					pathname: '/',
					state: { userinfo: data },
				});
			})
			.catch((err) => {
				setModalIsOpen(true);
			});
		onReset();
	};

	const onClickSignup = () => {
		history.push({
			pathname: '/signup',
		});
	};

	return (
		<LoginContainer>
			<LogoIcon />
			<InputContainer>
				<AccountIcon />
				<Input
					name="id"
					value={id}
					placeholder="아이디"
					onChange={onChange}
					autoComplete="off"
				/>
			</InputContainer>
			<InputContainer>
				<PasswordIcon />
				<Input
					name="password"
					value={password}
					placeholder="비밀번호"
					onChange={onChange}
					type="password"
				/>
			</InputContainer>
			<Button onClick={onClickLogin}>login</Button>
			<SignupButton onClick={onClickSignup}>Sign up</SignupButton>

			<Modal
				isOpen={modalIsOpen}
				onRequestClose={() => setModalIsOpen(false)}
				ariaHideApp={false}
			>
				{modalText}
				<FlexMiddleDiv>
					<ModalButton onClick={() => setModalIsOpen(false)}>Modal Close</ModalButton>
				</FlexMiddleDiv>
			</Modal>
		</LoginContainer>
	);
};

const LoginContainer = styled.div`
	position: absolute;
	top: 300px;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const LogoIcon = styled(Logo)`
	margin-bottom: 80px;
`;

const AccountIcon = styled(Account)`
	position: absolute;
	transform: translate(10px, 50%);
`;

const PasswordIcon = styled(Password)`
	position: absolute;
	transform: translate(10px, 50%);
`;

const Button = styled.button`
	width: 300px;
	height: 45px;
	background-color: ${(props) => props.theme.color.Primary};
	border: none;
	border-radius: 8px;
	color: ${(props) => props.theme.color.PrimaryBG};
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	margin-top: 20px;
`;

const SignupButton = styled.button`
	width: fit-content;
	border: none;
	background-color: rgba(0, 0, 0, 0);
	color: ${(props) => props.theme.color.Primary};
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	margin-top: 20px;
	align-self: flex-end;
`;

const InputContainer = styled.div`
	position: relative;
`;

const Input = styled.input`
	width: 300px;
	height: 45px;
	border: solid 1px ${(props) => props.theme.color.Primary};
	border-radius: 8px;
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	padding: 20px 20px 20px 40px;
	margin-bottom: 20px;
	&:focus {
		outline: none;
	}
`;

const FlexMiddleDiv = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 30px;
`;

Modal.defaultStyles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.75)',
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		position: 'absolute',
		width: '400px',
		height: '200px',
		border: '1px solid #ccc',
		background: '#fff',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		borderRadius: '4px',
		outline: 'none',
		padding: '30px',
	},
};

export default LoginComponent;
