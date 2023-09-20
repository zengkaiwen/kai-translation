import styled, { keyframes } from 'styled-components';

const rotation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;
const Wrapper = styled.span`
  width: 24px;
  height: 24px;
  border: 3px solid #dfdfdf;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: ${rotation} 1s linear infinite;
  &::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    background: #c2c2c2;
    width: 8px;
    height: 8px;
    transform: translate(-50%, 50%);
    border-radius: 50%;
  }
`;

const IconSpin = () => <Wrapper />;

export default IconSpin;
