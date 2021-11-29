import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import ModalComponent, { ModalType } from '@component/common/ModalComponent';
import { ReactComponent as Account } from '@asset/image/icons/icon_login_user.svg';
import { ReactComponent as Password } from '@asset/image/icons/icon_login_password.svg';
import { ReactComponent as Logo } from '@asset/image/icons/logo_big.svg';

interface Props {}

const SignupPage: React.FC<Props> = () => {
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
	const [failureModalText, setFailureModalText] = useState(
		'올바르지 않은 아이디 또는 비밀번호 입니다.'
	);
	const [isOpenFailureModal, setOpenFailureModal] = useState(false);

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
					setFailureModalText('올바르지 않은 아이디 또는 비밀번호 입니다.');
					setOpenFailureModal(true);
				} else if (response.status === 409) {
					setFailureModalText('중복된 아이디 입니다.');
					setOpenFailureModal(true);
				} else {
					setFailureModalText('회원가입이 불가합니다.');
					setOpenFailureModal(true);
				}
			});
		} else {
			setFailureModalText('올바르지 않은 아이디 또는 비밀번호 입니다.');
			setOpenFailureModal(true);
		}
	};

	const onPasswordCheckKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			onClickSignup();
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
		<SignupPageBackground>
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
						onKeyPress={onPasswordCheckKeyPress}
					/>
				</InputContainer>
				<HintBox>
					4 ~ 13자 영문 대소문자, 숫자, 특수문자 (!@#$%^&*) 로 입력해 주세요.
				</HintBox>
				<WarningBox>{isWarning ? '비밀번호가 일치하지 않습니다.' : ''}</WarningBox>
				<Button onClick={onClickSignup} style={{ float: 'right' }}>
					회원가입
				</Button>
				<LoginButton onClick={onClickBack}> 로그인 </LoginButton>
				<FailureModal
					isOpen={isOpenFailureModal}
					setOpen={setOpenFailureModal}
					modalType={ModalType.Error}
				>
					<p>{failureModalText}</p>
				</FailureModal>
			</SignupContainer>
		</SignupPageBackground>
	);
};

const SignupPageBackground = styled.div`
	width: 100%;
	height: 100vh;
	background-color: ${(props) => props.theme.color.PrimaryBG};
	display: flex;
	align-items: center;
	justify-content: center;
`;

const SignupContainer = styled.div`
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

const FailureModal = styled(ModalComponent)``;

export default SignupPage;
