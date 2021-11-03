import React from 'react';
import logo from "../asset/image/logo.png";
import profile from "../asset/image/profile.png";
import styled from "styled-components";
import { User } from '../model';

export type hasUserProps = {
    user: User | null;
}

const Header: React.FC<hasUserProps> = ({ user })=>{
    return (
        <HeaderSection>
            <Logo src={logo}></Logo>
            <Profile src={profile} style={{visibility: user ? 'visible' : 'hidden'}}></Profile>
        </HeaderSection>
    )
}

const HeaderSection = styled.div`
    width: 100%;
    height: 60px;
    background-color: #282828;
`;

const Logo = styled.img`
    width: auto;
    height: 80%;
    margin: 6px 10px 6px 10px;
`;
const Profile = styled.img`
    margin: 6px 10px 6px 10px;
`;
export default Header;