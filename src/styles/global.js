import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * {
    font-family: Helvetica;
  }
  body {
    padding: 0;
    margin: 0;
    background-color: #212121;
    
  }
  p {
    color: #e6e6e6;
  }
`;

export const Button = styled.button`
  background-color: ${props => (props.color ? props.color : "white")}
  color: ${props => (props.color ? "white" : "black")}
  padding: 12px 32px;
  border: none;
  border-radius: 60px;
  font-size: 14px;
  text-transform: uppercase;
  outline: none;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export const Input = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border-style: none;
  box-shadow: 0px 0px 0px 1px gray;
  font-size: 14px;
  outline: none;
`;

export const H1 = styled.h1`
  font-size: 48px;
  color: white;
`;

export const H2 = styled.h2`
  font-size: 32px;
  color: white;
`;

export const AppContainer = styled.div`
  padding: 20px;
`;
