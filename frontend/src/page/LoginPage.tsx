import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { User } from '../model';
import ModalComponent, { ModalType } from '@component/common/modalComponent';
import { ReactComponent as Account } from '@asset/image/icons/icon_login_user.svg';
import { ReactComponent as Password } from '@asset/image/icons/icon_login_password.svg';
import { ReactComponent as Logo } from '@asset/image/icons/logo_big.svg';

interface Props {
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const LoginPage: React.FC<Props> = ({ setUser }) => {
	interface Inputs {
		id: string;
		password: string;
	}

	const history = useHistory();

	const [inputs, setInputs] = useState<Inputs>({ id: '', password: '' });
	const [failureModalText, setFailureModalText] = useState(
		'올바르지 않은 아이디 또는 비밀번호 입니다.'
	);
	const [isOpenFailureModal, setOpenFailureModal] = useState(false);
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
				setOpenFailureModal(true);
			});
		onReset();
	};

	const onClickSignup = () => {
		history.push({
			pathname: '/signup',
		});
	};
	const onPasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			onClickLogin();
		}
	};

	return (
		<LoginPageBackground>
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
						onKeyPress={onPasswordKeyPress}
					/>
				</InputContainer>
				<Button onClick={onClickLogin}> 로그인 </Button>
				<SignupButton onClick={onClickSignup}> 회원가입 </SignupButton>
				<FailureModal
					isOpen={isOpenFailureModal}
					setOpen={setOpenFailureModal}
					modalType={ModalType.Error}
				>
					<p>{failureModalText}</p>
				</FailureModal>
			</LoginContainer>
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

const LoginContainer = styled.div`
	position: absolute;
	top: 22%;
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

const FailureModal = styled(ModalComponent)``;

export default LoginPage;
