import type { SwitchChangeEventHandler } from 'rc-switch';
import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import RcSwitch from 'rc-switch';

const rcSwitchOn = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1.1);
  }
`;
const rcSwitchOff = keyframes`
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;
const Wrapper = styled(RcSwitch)`
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 40px;
  height: 20px;
  line-height: 18px;
  padding: 0;
  vertical-align: middle;
  border-radius: 10px;
  border: 1px solid #d2d2d2;
  background-color: #e5e5e5;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.35, 0, 0.25, 1);
  overflow: hidden;

  .rc-switch-inner-checked,
  .rc-switch-inner-unchecked {
    font-size: 12px;
    position: absolute;
    top: 0;
    transition: left 0.3s cubic-bezier(0.35, 0, 0.25, 1);
  }

  .rc-switch-inner-checked {
    color: #fff;
    left: -10px;
  }

  .rc-switch-inner-unchecked {
    color: #9c9c9c;
    left: 20px;
  }

  &:after {
    position: absolute;
    width: 16px;
    height: 16px;
    left: 1px;
    top: 1px;
    border-radius: 50% 50%;
    background-color: #fff;
    content: ' ';
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.26);
    transform: scale(1);
    transition: left 0.3s cubic-bezier(0.35, 0, 0.25, 1);
    animation-timing-function: cubic-bezier(0.35, 0, 0.25, 1);
    animation-duration: 0.3s;
    animation-name: ${rcSwitchOff};
  }

  &:hover:after {
    transform: scale(1.1);
    animation-name: ${rcSwitchOn};
  }

  &:focus {
    box-shadow: 0 0 0 2px tint(#cc01cc, 80%);
    outline: none;
  }

  &.rc-switch-checked {
    border: 1px solid #6659ea;
    background-color: #6659ea;

    &:after {
      left: 21px;
    }

    .rc-switch-inner-checked {
      left: 6px;
    }

    .rc-switch-inner-unchecked {
      left: 46px;
    }
  }

  &.rc-switch-disabled {
    cursor: no-drop;
    background: #ccc;
    border-color: #ccc;

    &:after {
      background: #9e9e9e;
      animation-name: none;
      cursor: no-drop;
    }

    &:hover:after {
      transform: scale(1);
      animation-name: none;
    }
  }

  .rc-switch-label {
    display: inline-block;
    line-height: 22px;
    font-size: 14px;
    padding-left: 10px;
    vertical-align: middle;
    white-space: normal;
    pointer-events: none;
    user-select: text;
  }
`;

export interface SwitchProps {
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: SwitchChangeEventHandler;
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
}

const Switch: React.FC<SwitchProps> = ({
  className,
  checked,
  disabled,
  onChange,
  checkedChildren,
  unCheckedChildren,
}) => {
  return (
    <Wrapper
      className={className}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      checkedChildren={checkedChildren}
      unCheckedChildren={unCheckedChildren}
    />
  );
};

export default Switch;
