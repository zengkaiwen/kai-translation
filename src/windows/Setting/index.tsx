import styled from 'styled-components';
import { appWindow } from '@tauri-apps/api/window';
import Scrollbar from '@/components/Scrollbar';
import Switch from '@/components/Switch';
import ShortcutInput from '@/components/ShortcutInput';
import { useAtom } from 'jotai';
import { underlineOpened, underlineShortcut } from '@/store';
import useSettingConfig from '@/hooks/useSettingConfig';
import { useThrottleEffect } from 'ahooks';

const Wrapper = styled.div`
  width: 480px;
  height: 320px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  background-color: #ffffff;
  box-sizing: border-box;

  .toolbar {
    margin: 4px 12px;
    padding: 8px 10px;
    background-color: #ffffff;
    cursor: move;
    .left {
      gap: 10px;
      span + span {
        padding: 4px 6px;
        background-color: #6659ea;
        color: #ffffff;
        font-size: 12px;
        border-radius: 4px;
      }
    }
    .right {
      gap: 10px;
    }
  }
  .icon {
    background-color: #787878;
    color: #787878;
    &:hover {
      background-color: #6659ea;
      color: #6659ea;
    }
  }

  main {
    overflow-x: hidden;
    max-height: calc(320px - 44px);
    .ms-container {
      max-height: inherit;
    }

    ul {
      margin: 10px 12px;
      border-radius: 6px;
      padding: 8px 16px;
      background-color: #f6f8fa;
      li {
        padding: 12px 0;
        > div:nth-child(1) {
          padding-right: 10px;
          width: 50%;
        }
        h5 {
          font-size: 14px;
        }
        p.tip {
          margin-top: 8px;
          font-size: 12px;
          color: #7c7c7c;
        }
      }
      li + li {
        border-top: 1px solid #e5e5e5;
      }
      .shortcut {
        width: 200px;
      }
    }
  }
`;

const Setting = () => {
  const { settings, saveSettings } = useSettingConfig();
  const [atomUnderlineOpened, setAtomUnderlineOpened] = useAtom(underlineOpened);
  const [atomUnderlineShortcut, setAtomUnderlineShortcut] = useAtom(underlineShortcut);

  useThrottleEffect(
    () => {
      if (!settings) return;
      saveSettings({
        ...settings,
        underline: atomUnderlineOpened,
        underlineShortcut: atomUnderlineShortcut,
      });
    },
    [atomUnderlineOpened, atomUnderlineShortcut, settings],
    {
      wait: 1000,
      trailing: true,
    },
  );

  return (
    <Wrapper>
      <div className="toolbar flex items-center justify-between" data-tauri-drag-region>
        <div className="left flex items-center">
          <span>偏好设置</span>
        </div>
        <div className="right flex items-center">
          {/* <span className="i-carbon-time" title="历史记录" />
            <span className="i-carbon-settings" title="设置" /> */}
          <span className="i-carbon-close-large icon" onClick={() => appWindow.hide()} title="隐藏窗口" />
        </div>
      </div>
      {settings && (
        <main>
          <Scrollbar>
            <ul>
              <li className="flex items-center justify-between">
                <div>
                  <h5>划词翻译</h5>
                  <p className="tip">是否开启划词翻译功能</p>
                </div>
                <div>
                  <Switch
                    checked={atomUnderlineOpened}
                    checkedChildren="开"
                    unCheckedChildren="关"
                    onChange={(v) => setAtomUnderlineOpened(v)}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <h5>划词翻译快捷键</h5>
                  <p className="tip">设置唤起划词翻译的快捷键</p>
                </div>
                <div>
                  <ShortcutInput
                    className="shortcut"
                    value={atomUnderlineShortcut}
                    onChange={(s) => setAtomUnderlineShortcut(s)}
                  />
                </div>
              </li>
            </ul>
            {/* <ul>
            <li className="flex items-center justify-between">
              <div>
                <h5>主副逻辑</h5>
              </div>
              <div>1</div>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <h5>主语言</h5>
              </div>
              <div>1</div>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <h5>副语言</h5>
              </div>
              <div>1</div>
            </li>
          </ul> */}
          </Scrollbar>
        </main>
      )}
    </Wrapper>
  );
};

export default Setting;
