import styled from 'styled-components';

interface Props{
    top: number;
    left: number;
}

const ContextDropdown = styled.ul<Props>`
    font-size: 14px;
    background-color: #fff;
    border-radius: 8px;
    padding: 5px 0 5px 0;
    width: 150px;
    height: auto;
    margin: 0;
    position: absolute;
    list-style: none;
    box-shadow: 0 0 20px 0 #ccc;
    opacity: 1;
    transition: opacity 0.5s linear;
    top: ${(props) => props.top}px;
    left: ${(props) => props.left}px;
`;

export default ContextDropdown;