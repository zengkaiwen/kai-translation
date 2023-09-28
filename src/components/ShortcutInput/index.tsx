import useRandomId from '@/hooks/useRandomId';
import styled from 'styled-components';
import { type, OsType } from '@tauri-apps/api/os';
import * as React from 'react';
import { useMount } from 'ahooks';
import cls from 'classnames';

const Wrapper = styled.div`
  position: relative;
  min-width: 100px;
  height: 32px;
  border-radius: 6px;
  background-color: #e5e5e5;
  overflow: hidden;

  input,
  label,
  > div {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  /* 清除默认样式 */
  input {
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    color: transparent;
    transition: all 0.3s ease-in-out;
    &:focus {
      outline: none;
      caret-color: transparent;
    }
    /* global */
    flex: auto;
    height: inherit;
    &::placeholder {
      color: transparent;
      transition: all 0.3s ease-in-out;
    }
  }

  > div {
    display: flex;
    gap: 4px;
    padding: 0 8px;
    font-size: 12px;
    color: #9c9c9c;
    span {
      color: inherit;
      font-weight: 100;
      transition: all 0.3s ease-in-out;
    }
    span.active {
      color: #6659ea;
      font-weight: 500;
      transition: all 0.3s ease-in-out;
    }
  }

  label {
    transition: all 0.3s ease-in-out;
    box-sizing: border-box;
    border-radius: 6px;
  }

  input:focus + label {
    border: 1px solid #6659ea;
    border-radius: 6px;
    transition: all 0.3s ease-in-out;
  }
`;

export interface ShortcutInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onChange?: (shortcut: string) => void;
}

function code2Key(code: string): string {
  if (code.indexOf('Key') === 0) {
    return code.slice(3);
  }
  if (code.indexOf('Digit') === 0) {
    return code.slice(5);
  }
  return code;
}

const ShortcutInput: React.FC<ShortcutInputProps> = ({ value, onChange, ...rest }) => {
  const uuid = useRandomId();
  const [osType, setOsType] = React.useState<OsType>();

  const [shiftKey, setShiftKey] = React.useState<boolean>(false);
  const [ctrlKey, setCtrlKey] = React.useState<boolean>(false);
  const [altKey, setAltKey] = React.useState<boolean>(false);
  const [optKey, setOptKey] = React.useState<boolean>(false);
  const [cmdKey, setCmdKey] = React.useState<boolean>(false);
  const [otherVal, setOtherVal] = React.useState<string>('');

  const getOsType = React.useCallback(async () => {
    const os = await type();
    console.log('os', os);
    setOsType(os);
  }, []);

  const renderShortcut = React.useCallback(() => {
    if (!value) return;
    console.log('渲染shortcut', value);
    const shortcutArr = value.split('+') || [];
    if (shortcutArr.includes('Shift')) {
      setShiftKey(true);
    } else {
      setShiftKey(false);
    }
    if (shortcutArr.includes('Ctrl')) {
      setCtrlKey(true);
    } else {
      setCtrlKey(false);
    }
    if (shortcutArr.includes('Alt')) {
      osType === 'Darwin' && setOptKey(true);
      osType === 'Windows_NT' && setAltKey(true);
    } else {
      osType === 'Darwin' && setOptKey(false);
      osType === 'Windows_NT' && setAltKey(false);
    }
    if (shortcutArr.includes('Command')) {
      setCmdKey(true);
    } else {
      setCmdKey(false);
    }
    setOtherVal(shortcutArr[shortcutArr.length - 1]);
  }, [osType, value]);
  React.useEffect(() => {
    renderShortcut();
  }, [renderShortcut, value]);

  useMount(() => {
    getOsType();
  });

  const emitChange = React.useCallback(() => {
    const shortcutArr: string[] = [];
    // 下面这个顺序不要动，不然快捷键监听会失效
    if (cmdKey && osType === 'Darwin') {
      shortcutArr.push('Command');
    }
    if (optKey || altKey) {
      shortcutArr.push('Alt');
    }
    if (ctrlKey) {
      shortcutArr.push('Ctrl');
    }
    if (shiftKey) {
      shortcutArr.push('Shift');
    }
    if (otherVal) {
      shortcutArr.push(otherVal);
    }
    if (typeof onChange === 'function') {
      onChange(shortcutArr.join('+'));
    }
  }, [altKey, cmdKey, ctrlKey, onChange, optKey, osType, otherVal, shiftKey]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = React.useCallback(
    (e) => {
      // console.log('按下', e.code);
      // console.log('shift = ', e.shiftKey);
      // console.log('ctrl =', e.ctrlKey);
      // console.log('meta = ', e.metaKey);
      // console.log('alt = ', e.altKey);
      // shiftKey
      if (e.shiftKey) {
        setShiftKey(true);
      } else {
        setShiftKey(false);
      }
      // ctrlKey
      if (e.ctrlKey) {
        setCtrlKey(true);
      } else {
        setCtrlKey(false);
      }
      // metaKey MacOS command
      if (e.metaKey) {
        osType === 'Darwin' && setCmdKey(true);
      } else {
        osType === 'Darwin' && setCmdKey(false);
      }
      // altKey
      if (e.altKey) {
        osType === 'Darwin' && setOptKey(true);
        osType === 'Windows_NT' && setAltKey(true);
      } else {
        osType === 'Darwin' && setOptKey(false);
        osType === 'Windows_NT' && setAltKey(false);
      }
      if (['Shift', 'Meta', 'Control', 'Alt'].includes(e.key)) {
        setOtherVal('');
      } else {
        setOtherVal(code2Key(e.code));
      }
    },
    [osType],
  );

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = React.useCallback(
    (e) => {
      // console.log('抬起');
      const funcKeyIsDown =
        shiftKey ||
        ctrlKey ||
        (osType === 'Darwin' && optKey) ||
        (osType === 'Windows_NT' && altKey) ||
        (osType === 'Darwin' && cmdKey);
      const otherKeyIsDown = !!otherVal;
      if (funcKeyIsDown && otherKeyIsDown) {
        emitChange();
      } else {
        setShiftKey(false);
        setCtrlKey(false);
        setOptKey(false);
        setAltKey(false);
        setCmdKey(false);
        setOtherVal('');
      }
    },
    [altKey, cmdKey, ctrlKey, emitChange, optKey, osType, otherVal, shiftKey],
  );

  return (
    <Wrapper {...rest}>
      <div className="flex items-center">
        <span className={cls({ active: shiftKey })}>Shift</span>
        <span className={cls({ active: ctrlKey })}>Ctrl</span>
        {osType === 'Darwin' && <span className={cls({ active: optKey })}>Opt</span>}
        {osType === 'Windows_NT' && <span className={cls({ active: altKey })}>Alt</span>}
        {osType === 'Darwin' && <span className={cls({ active: cmdKey })}>Cmd</span>}
        <span className={cls({ active: !!otherVal })}>{otherVal}</span>
      </div>
      <input
        id={uuid}
        type="text"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onChange={(e) => e.preventDefault()}
      />
      <label htmlFor={uuid} />
    </Wrapper>
  );
};

export default ShortcutInput;
