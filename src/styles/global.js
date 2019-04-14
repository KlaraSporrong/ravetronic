import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    font-family: Helvetica;
  }
  html, body {
    padding: 0;
    margin: 0;
  }
  p {
    color: #e6e6e6;
  }

  body {
    animation: colorchange 10s infinite; /* animation-name followed by duration in seconds*/
       /* you could also use milliseconds (ms) or something like 2.5s */
    -webkit-animation: colorchange 10s infinite; /* Chrome and Safari */
  }

  @keyframes colorchange
  {
    0%   {background: #970FF2;}
    14%  {background: #0597F2;}
    28%  {background: #49D907;}
    42%  {background: #FFC500;}
    58%  {background: #F24607;}
    72%  {background: #EA2F83;}
    86%  {background: #E81400;}
    100% {background: #970FF2;}
  }

  @-webkit-keyframes colorchange /* Safari and Chrome - necessary duplicate */
  {
    0%   {background: #970FF2;}
    14%  {background: #0597F2;}
    28%  {background: #49D907;}
    42%  {background: #FFC500;}
    58%  {background: #F24607;}
    72%  {background: #EA2F83;}
    86%  {background: #E81400;}
    100% {background: #970FF2;}
  }
`;

export const Button = styled.button`
  background-color: ${props => (props.color ? props.color : 'white')}
  color: ${props => (props.color ? 'white' : 'black')}
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
