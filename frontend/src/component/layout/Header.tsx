import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as logoMain} from '../../asset/image/icons/logo_main.svg';
import { ReactComponent as profile } from '../../asset/image/icons/icon_user.svg';
import styled from 'styled-components';
import { User } from '../../model';
import Button from '../common/Button';
import { useHistory } from 'react-router';

import {ReactComponent as LogoSvg} from '../../asset/image/icons/logo.svg';

export type hasUserProps = {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const Header: React.FC<hasUserProps> = ({ user, setUser }) => {
	const [isOpenModal, setOpenModal] = useState(false);
    const profileModal = useRef<HTMLDivElement>(null);
	const history = useHistory();

	const onClickProfile = () => {
		setOpenModal((prev) => !prev);
	};
    
	const handleCloseModal = (e: MouseEvent) => {
		if (isOpenModal && !profileModal.current?.contains(e.target as Node)) {
			setOpenModal(false);
		}
	}
	const onClickLogoutButton = () => {
		fetch('/logout', {
			method: 'POST',
			credentials: 'include'
		})
		.then((res) => {
			if (res.ok) {
				setUser(null);
				localStorage.removeItem('user');
				history.push('/login');
				return;
			}
			throw new Error(res.status.toString());
		})
		.catch((err) => {
			console.error(err);
		})
	}
    
	useEffect(() => {
		window.addEventListener('click', handleCloseModal);
		return () => {
			window.removeEventListener('click', handleCloseModal)
		}
	}, [isOpenModal]);

	return (
		<HeaderSection>
			<Logo href='/'>
                <LogoImage/>
            </Logo>
			<ProfileBox show={!!user}>
				<Profile onClick={onClickProfile} />
				{isOpenModal && (
					<ProfileModal ref={profileModal}>
						<UserNameBox> 
							<ProfileLogo />
							<UserName> {user?.loginId}</UserName>
						</UserNameBox>
						<LogoutButton onClick={onClickLogoutButton}> 로그아웃 </LogoutButton>
					</ProfileModal>
				)}
			</ProfileBox>
		</HeaderSection>
	);
};

const HeaderSection = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	height: ${(props) => props.theme.HeaderHeight};
	background-color:${(props) => props.theme.color.HeaderBG};
`;

const Logo = styled.a`
    display: flex;
    flex-direction: row;
	cursor: pointer;
	margin-left: 40px;
`;

const LogoImage = styled(logoMain)``;

const ProfileBox = styled.div<{ show: boolean }>`
	visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
	position: relative;
    display: flex;
    flex-direction: row;
`;
const Profile = styled(profile)`
	width: 40px;
    cursor: pointer;
	margin: 10px 40px 10px 40px;
`;
const ProfileModal = styled.div`
	position: absolute;
    top: 150%;
    right: 0;
    
    border: 1px solid ${(props) => props.theme.color.Line};
    border-radius: 8px;
    background-color: ${(props) => props.theme.color.PrimaryBG};
    box-shadow: 5px 3px 5px grey;
    
    padding: 20px 50px;
    text-align: center;
`;
const UserNameBox = styled.div`
	display: flex;
	margin-bottom: 5px;
`;
const ProfileLogo = styled(LogoSvg)`
	width: 40px;
	margin-right: 10px;
`;
const UserName = styled.p`
    font-size: ${props => props.theme.fontSize.Title};
`;
const LogoutButton = styled(Button)`
    background-color: ${(props) => props.theme.color.Primary};
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.3);
    color: white;
    padding: 10px;
    border: none;
    box-shadow: 3px 1px 3px grey;
    
    font-size: ${(props) => props.theme.fontSize.Content};
`;

export default Header;
