import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Modal from 'react-modal';

import { ReactComponent as Account } from '@asset/image/icons/icon_login_user.svg';
import { ReactComponent as Password } from '@asset/image/icons/icon_login_password.svg';
import { ReactComponent as Logo } from '@asset/image/icons/logo_big.svg';

interface Props {}

const SignupComponent: React.FC<Props> = () => {
	interface Inputs {
		id: string;
		password: string;
		passwordCheck: string;
	}

	const history = useHistory();

	const [inputs, setInputs] = useState<Inputs>({
		id: '',
		password: '',
		passwordCheck: '',
	});

	const [isWarning, setIsWarning] = useState(false);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [modalText, setModalText] = useState('유효하지 않은 아이디 또는 비밀번호 입니다.');

	const { id, password, passwordCheck } = inputs;

	const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		const { value, name } = target;
		setInputs({
			...inputs,
			[name]: value,
		});
	};

	const isRightIdRex = () => {
		const pattern = /^([a-zA-Z0-9]){4,13}$/;
		return pattern.test(id);
	};

	const isRightPasswordRex = () => {
		const pattern = /^([a-zA-Z0-9!@#$%^&*]){4,13}$/;
		return pattern.test(password);
	};

	const isEqualPassword = () => {
		return password === passwordCheck;
	};

	const onClickBack = () => {
		history.goBack();
	};

	const onClickSignup = () => {
		if (isRightIdRex() && isRightPasswordRex() && isEqualPassword()) {
			fetch(`/signup`, {
				method: 'POST',
				headers: {
					'Content-type': 'application/json',
				},
				body: JSON.stringify(inputs),
			}).then((response) => {
				if (response.ok) {
					history.push({
						pathname: '/login',
					});
				} else if (response.status === 400) {
					setModalText('유효하지 않은 아이디 또는 비밀번호 입니다.');
					setModalIsOpen(true);
				} else if (response.status === 409) {
					setModalText('중복된 아이디 입니다.');
					setModalIsOpen(true);
				} else {
					setModalText('회원가입 안됨');
					setModalIsOpen(true);
				}
			});
		} else {
			setModalText('유효하지 않은 아이디 또는 비밀번호 입니다.');
			setModalIsOpen(true);
		}
	};

	useEffect(() => {
		if (isEqualPassword()) {
			setIsWarning(false);
		} else {
			setIsWarning(true);
		}
	}, [isEqualPassword]);

	return (
		<>
			<SignupContainer>
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
				<HintBox>4 ~ 13자 영문 대소문자, 숫자로 입력해 주세요.</HintBox>
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
				<InputContainer>
					<PasswordIcon />
					<Input
						name="passwordCheck"
						value={passwordCheck}
						placeholder="비밀번호 확인"
						onChange={onChange}
						type="password"
					/>
				</InputContainer>
				<HintBox>
					4 ~ 13자 영문 대소문자, 숫자, 특수문자 (!@#$%^&*) 로 입력해 주세요.
				</HintBox>
				<WarningBox>{isWarning ? '비밀번호가 일치하지 않습니다.' : ''}</WarningBox>
				<Button onClick={onClickSignup} style={{ float: 'right' }}>
					Sign up
				</Button>
				<LoginButton onClick={onClickBack}>login</LoginButton>
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
			</SignupContainer>
		</>
	);
};

const SignupContainer = styled.div`
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

const LoginButton = styled.button`
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
const HintBox = styled.p`
	width: 290px;
	word-break: break-all;
	margin-top: -10px;
	margin-bottom: 20px;
	font: ${(props) => props.theme.fontSize.Hint} ${(props) => props.theme.FontFamily.Light};
`;
const WarningBox = styled.div`
	width: 290px;
	height: 12px;
	margin-top: -10px;
	font: ${(props) => props.theme.fontSize.Content} ${(props) => props.theme.FontFamily.Medium};
	color: #ff0000;
	font-size: 12px;
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

export const ModalButton = styled.div`
	background-color: ${(props) => props.theme.color.Primary};
	border: none;
	border-radius: 6px;
	color: ${(props) => props.theme.color.PrimaryBG};
	font-size: 12px;
	padding: 10px;
`;
export default SignupComponent;
