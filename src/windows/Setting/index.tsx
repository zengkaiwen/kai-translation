import * as React from 'react';
import styled from 'styled-components';
import { appWindow } from '@tauri-apps/api/window';
import Scrollbar from '@/components/Scrollbar';
import Switch from '@/components/Switch';
import ShortcutInput from '@/components/ShortcutInput';
import { useAtom } from 'jotai';
import {
  innerPlan,
  mainLanguage,
  subLanguage,
  underlineOpened,
  underlineShortcut,
  enterShortcut,
} from '@/store/setting';
import useSettingConfig from '@/hooks/useSettingConfig';
import { useThrottleEffect } from 'ahooks';
import { LanguageList } from '@/common/constants';
import Select, { SelectOption } from '@/components/Select';
import { toast } from 'react-hot-toast';
import cls from 'classnames';
import { theme } from '@/store/global';

const Wrapper = styled.div`
  width: 600px;
  height: 480px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.linePrimary};
  background-color: ${(props) => props.theme.bgPrimary};
  color: ${(props) => props.theme.textPrimary};
  box-sizing: border-box;
  transition: all 0.3s ease-in-out;

  .toolbar {
    padding: 12px 22px;
    cursor: grab;
    .left {
      gap: 10px;
      span + span {
        padding: 4px 6px;
        background-color: ${(props) => props.theme.themePrimary};
        color: ${(props) => props.theme.textPrimary};
        font-size: 12px;
        border-radius: 4px;
      }
    }
    .right {
      gap: 10px;
    }
  }
  .icon {
    background-color: ${(props) => props.theme.textPrimary};
    color: ${(props) => props.theme.textPrimary};
    &:hover {
      background-color: ${(props) => props.theme.themePrimary};
      color: ${(props) => props.theme.themePrimary};
    }
  }
  .container {
    overflow: hidden;
    height: calc(480px - 40px);
    border-top: 1px solid ${(props) => props.theme.linePrimary};
  }
  aside {
    /* padding-top: 10px; */
    overflow-x: hidden;
    width: 120px;
    height: calc(480px - 40px);
    box-sizing: border-box;
    color: ${(props) => props.theme.textSecond};
    border-right: 1px solid ${(props) => props.theme.linePrimary};
    li {
      padding: 10px 10px;
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      /* border-top-right-radius: 10px;
      border-bottom-right-radius: 10px; */
      overflow: hidden;
      &:not(.active):hover {
        color: ${(props) => props.theme.textFour};
        background-color: ${(props) => props.theme.themePrimary};
      }
      &.active {
        color: ${(props) => props.theme.bgPrimary};
        background-color: ${(props) => props.theme.themePrimary};
      }
    }
  }
  main {
    flex: 1;
    overflow-x: hidden;
    height: calc(480px - 40px);
    .ms-container {
      max-height: inherit;
    }

    .content {
      padding-bottom: 10px;
    }

    .themeSwitch:not(.rc-switch-disabled) {
      background-color: #ffffff;
      &.rc-switch-checked {
        background-color: #232320;
      }
      &:after {
        background-color: #232320;
        transition: all 0.3s ease-in-out;
      }
      &.rc-switch-checked::after {
        background-color: #ffffff;
      }
      .rc-switch-inner-checked {
        color: #fff;
      }
      .rc-switch-inner-unchecked {
        color: #000;
      }
    }

    hr {
      margin: 20px 12px;
      border: none;
      border-top: 1px solid ${(props) => props.theme.themePrimary};
    }
    hr + p {
      margin: 10px 12px;
      font-size: 12px;
      line-height: 14px;
      color: ${(props) => props.theme.textSecond};
    }

    ul {
      margin: 10px 12px;
      border-radius: 6px;
      padding: 8px 16px;
      background-color: ${(props) => props.theme.bgSecond};
      transition: background-color 0.3s ease-in-out;

      h4 {
        padding: 10px 0;
        font-size: 14px;
        font-weight: 700;
      }

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
          line-height: 14px;
          color: ${(props) => props.theme.textThird};
        }
      }
      li + li {
        border-top: 1px solid ${(props) => props.theme.linePrimary};
      }
      .shortcut {
        width: 200px;
      }
    }
  }
`;

const InnerTranslateEngine: SelectOption[] = [
  {
    label: '速度',
    value: 'speed',
  },
  {
    label: '准确度',
    value: 'accuracy',
  },
];

const Setting = () => {
  const [tabKey, setTabKey] = React.useState<'basic' | 'translate'>('basic');

  const { settings, saveSettings } = useSettingConfig();
  const [atomUnderlineOpened, setAtomUnderlineOpened] = useAtom(underlineOpened);
  const [atomUnderlineShortcut, setAtomUnderlineShortcut] = useAtom(underlineShortcut);
  const [atomEnterShortcut, setAtomEnterShortcut] = useAtom(enterShortcut);
  const [atomMainLanguage, setAtomMainLanguage] = useAtom(mainLanguage);
  const [atomSubLanguage, setAtomSubLanguage] = useAtom(subLanguage);
  const [atomTheme, setAtomTheme] = useAtom(theme);
  const [atomInnterPLan, setAtomInnterPLan] = useAtom(innerPlan);

  useThrottleEffect(
    () => {
      if (!settings) return;
      const settingsParams = {
        ...settings,
        underline: atomUnderlineOpened,
        underlineShortcut: atomUnderlineShortcut,
        enterShortcut: atomEnterShortcut,
        theme: atomTheme,
        innerPLan: atomInnterPLan,
      };
      if (atomMainLanguage !== atomSubLanguage) {
        settingsParams.mainLanguage = atomMainLanguage;
        settingsParams.subLanguage = atomSubLanguage;
      }
      saveSettings(settingsParams);
    },
    [
      atomUnderlineOpened,
      atomUnderlineShortcut,
      atomEnterShortcut,
      settings,
      atomMainLanguage,
      atomSubLanguage,
      atomTheme,
      atomInnterPLan,
    ],
    {
      wait: 1000,
      trailing: true,
    },
  );

  const memoLanguageList = React.useMemo<SelectOption[]>(() => {
    const list = LanguageList.slice(1);
    return list.map((item) => ({
      value: item.key,
      label: item.name,
    }));
  }, []);

  const mainLanguageOption = React.useMemo<SelectOption | undefined>(() => {
    return memoLanguageList.find((item) => item.value === atomMainLanguage);
  }, [atomMainLanguage, memoLanguageList]);

  const subLanguageOption = React.useMemo<SelectOption | undefined>(() => {
    return memoLanguageList.find((item) => item.value === atomSubLanguage);
  }, [atomSubLanguage, memoLanguageList]);

  const handleMainLangChange = React.useCallback(
    (option: SelectOption) => {
      if (option.value === atomSubLanguage) {
        toast.error('与副语言相同，注意主副语言不能一致');
      }
      setAtomMainLanguage(option.value);
    },
    [atomSubLanguage, setAtomMainLanguage],
  );

  const handleSubLangChange = React.useCallback(
    (option: SelectOption) => {
      if (option.value === atomMainLanguage) {
        toast.error('与主语言相同，注意主副语言不能一致');
      }
      setAtomSubLanguage(option.value);
    },
    [atomMainLanguage, setAtomSubLanguage],
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
        <div className="container flex justify-between">
          <aside>
            <ul>
              <li className={cls({ active: tabKey === 'basic' })} onClick={() => setTabKey('basic')}>
                基础设置
              </li>
              <li className={cls({ active: tabKey === 'translate' })} onClick={() => setTabKey('translate')}>
                翻译设置
              </li>
            </ul>
          </aside>
          <main>
            <Scrollbar>
              {tabKey === 'basic' && (
                <div className="content">
                  <ul>
                    <li className="flex items-center justify-between">
                      <div>
                        <h5>主题</h5>
                      </div>
                      <div>
                        <Switch
                          className="themeSwitch"
                          checked={atomTheme === 'dark'}
                          checkedChildren={<span className="i-carbon-moon" />}
                          unCheckedChildren={<span className="i-carbon-light" />}
                          onChange={(v) => setAtomTheme(v ? 'dark' : 'light')}
                        />
                      </div>
                    </li>
                  </ul>
                  <ul>
                    <li className="flex items-center justify-between">
                      <div>
                        <h5>主语言</h5>
                        <p className="tip">目标语言为自动时，默认翻译成主语言</p>
                      </div>
                      <Select options={memoLanguageList} value={mainLanguageOption} onChange={handleMainLangChange} />
                    </li>
                    <li className="flex items-center justify-between">
                      <div>
                        <h5>副语言</h5>
                        <p className="tip">原文为主语言，且目标语言为自动时，翻译成副语言</p>
                      </div>
                      <Select options={memoLanguageList} value={subLanguageOption} onChange={handleSubLangChange} />
                    </li>
                  </ul>
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
                    <li className="flex items-center justify-between">
                      <div>
                        <h5>输入翻译快捷键</h5>
                        <p className="tip">设置唤起窗口出现的快捷键</p>
                      </div>
                      <div>
                        <ShortcutInput
                          className="shortcut"
                          value={atomEnterShortcut}
                          onChange={(s) => setAtomEnterShortcut(s)}
                        />
                      </div>
                    </li>
                  </ul>
                </div>
              )}
              {tabKey === 'translate' && (
                <div className="content">
                  <ul>
                    <h4>内置翻译</h4>
                    {/* <li className="flex items-center justify-between">
                      <div>
                        <h5>是否开启</h5>
                      </div>
                      <div>
                        <Switch checkedChildren="开" unCheckedChildren="关" />
                      </div>
                    </li> */}
                    <li className="flex items-center justify-between">
                      <div>
                        <h5>优先方案</h5>
                        <p className="tip">
                          选择一种优先方案，准确度优先的翻译质量会更高，但翻译等待时长较久。速度优先相反
                        </p>
                      </div>
                      <Select
                        options={InnerTranslateEngine}
                        value={InnerTranslateEngine.find((item) => item.value === atomInnterPLan)}
                        onChange={(v) => setAtomInnterPLan(v.value)}
                      />
                    </li>
                  </ul>
                  {/* <hr />
                  <p>
                    以下为自定义翻译源，需要在对应翻译平台申请翻译接口的使用权限，按要求填写必要的 API 和 KEY
                    才能使用。本程序不会将用户的 API 与 KEY 上传
                  </p>
                  <h4>腾讯翻译君</h4> */}
                </div>
              )}
            </Scrollbar>
          </main>
        </div>
      )}
    </Wrapper>
  );
};

export default Setting;
