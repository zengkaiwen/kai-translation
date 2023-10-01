/* eslint-disable object-curly-spacing */
import * as React from 'react';
import { styled } from 'styled-components';
import { useMount, useUnmount, useUpdateEffect } from 'ahooks';
import { LogicalSize, appWindow, WebviewWindow } from '@tauri-apps/api/window';
import { writeText } from '@tauri-apps/api/clipboard';
import cls from 'classnames';
import { toast } from 'react-hot-toast';

import { LanguageList, TLanguageItem } from '@/common/constants';
import Accordion from '@/components/Accordion/index.tsx';
import IconSpin from '@/components/IconSpin/index.tsx';
import { rConsoleLog, rTranslate } from '@/utils';
import Scrollbar from '@/components/Scrollbar/index.tsx';
import useAutoCopyHook from './_hook/useAutoCopyHook';
import { listen } from '@tauri-apps/api/event';
import { SystemTrayPayload } from '@/common/systemtray.ts';
import useSettingConfig from '@/hooks/useSettingConfig.ts';
import { GlobalEvent } from '@/common/event';
import { Setting } from '@/utils/settings';
import useWindowVisible from './_hook/useWindowHide';

const Wrapper = styled.div`
  overflow: hidden;
  min-height: 264px;
  max-height: 720px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #e5e5e5;

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
  .i-carbon-chevron-left {
    transform: rotate(0deg);
    transition: all 0.3s ease-in-out;
    &.open {
      transform: rotate(-90deg);
      transition: all 0.3s ease-in-out;
    }
  }
  main {
    overflow-x: hidden;
    max-height: calc(720px - 44px);
    .ms-container {
      max-height: inherit;
    }
    .original {
      margin: 10px 12px;
      border-radius: 6px;
      padding: 8px 10px;
      background-color: #f6f8fa;
      textarea {
        margin: 0;
        padding: 0;
        width: 100%;
        border: none;
        resize: none;
        font-size: 13px;
        line-height: 20px;
        color: #232323;

        border-radius: 0;
        background: transparent;
        appearance: none;
        -webkit-appearance: none;
        color: ${(props) => props.theme.textColorPrimary};
        transition: all 0.3s ease-in-out;
        font-family: inherit;
        box-sizing: border-box;
        &::placeholder {
          font-family: 'PingFangSC-Regular', 'Microsoft YaHei', Courier, monospace;
        }
        &:focus {
          outline: none;
        }
        height: auto;
        &::placeholder {
          font-family: 'TrubitPLEX';
          color: ${(props) => props.theme.textColorFourth};
          transition: all 0.3s ease-in-out;
        }
        &::-webkit-scrollbar {
          display: none;
        }
      }
      .option-bar {
        margin-top: 10px;
        gap: 10px;
      }
    }
    .language-select {
      margin: 10px 12px;
      border-radius: 6px;
      font-size: 14px;
      background-color: #f6f8fa;
      .header {
        padding: 8px 10px;
        > div {
          flex: 1 0 80px;
          margin: 0 20px;
          cursor: pointer;
          span + span {
            margin-left: 10px;
          }
        }
        > div:nth-child(2) {
          flex: 1 0 50px;
        }
      }
      .content {
        padding: 20px 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.04);
        flex-wrap: wrap;
        > div {
          margin: 4px 4px;
          padding: 4px 8px;
          font-size: 12px;
          line-height: 14px;
          background-color: #efefef;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          &:hover {
            background-color: #d2d2d2;
          }
          &.active {
            background-color: #d2d2d2;
          }
          &.disabled {
            pointer-events: none;
            cursor: not-allowed;
            color: #999;
          }
          span:nth-child(2) {
            padding-left: 4px;
          }
        }
      }
    }
    .result-panel {
      margin: 10px 12px;
      border-radius: 6px;
      background-color: #f6f8fa;
      .header {
        padding: 8px 10px;
        font-size: 14px;
        line-height: 20px;
      }
      .content {
        padding: 18px 10px 8px;
        border-top: 1px solid rgba(0, 0, 0, 0.04);
        font-size: 14px;
        line-height: 20px;
        color: #363636;
      }
      .loading {
        min-height: 36px;
      }
      .empty {
        padding: 8px 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.04);
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        color: #a2a2a2;
      }
      .footer {
        padding: 8px 10px;
        gap: 10px;
        height: 20px;
      }
    }
  }
`;

const observer = new ResizeObserver((entries) => {
  for (let entry of entries) {
    if (entry.target === document.body) {
      const bodyHeight = entry.target.scrollHeight;
      appWindow.setSize(new LogicalSize(420, bodyHeight));
    }
  }
});

function App() {
  const settingWindowRef = React.useRef<WebviewWindow | null>(null);
  const { loadSettings } = useSettingConfig();
  useWindowVisible();

  const copyText = useAutoCopyHook();
  useUpdateEffect(() => {
    setText(copyText);
    handleTranslate(copyText);
  }, [copyText]);

  useMount(() => {
    // 将body元素添加到观察者中
    observer.observe(document.body);

    // 监听 systemTray 输入翻译指令
    listen(GlobalEvent.SYSTEM_TRAY_ITEM_CLICK, (event) => {
      const { id } = event.payload as SystemTrayPayload;
      rConsoleLog(`systemTray item click, id: ${id}`);
      switch (id) {
        case 'quit':
          break;
        case 'show':
          appWindow.show();
          break;
        case 'setting':
          showSettingWindow();
          break;
        case 'about':
          break;
      }
    });

    listen(GlobalEvent.SETTINGS_UPDATED, (event) => {
      rConsoleLog(`设置项更新：${JSON.stringify(event.payload)}`);
      const settings = event.payload as Setting;
      loadSettings(settings);
    });
  });

  useUnmount(() => {
    observer.unobserve(document.body);
  });

  // 原文与翻译后的文案
  const [text, setText] = React.useState<string>('');
  const [translateText, setTranslateText] = React.useState<string>('');

  // 语言类型
  const [sourceLang, setSourceLang] = React.useState<TLanguageItem>(LanguageList[0]);
  const [targetLang, setTargetLang] = React.useState<TLanguageItem>(LanguageList[2]);
  const [openSourcePanel, setOpenSourcePanel] = React.useState<boolean>(false);
  const [openTargetPanel, setOpenTargetPanel] = React.useState<boolean>(false);

  const handleLangPanel = React.useCallback(
    (type: 'source' | 'target') => {
      if (type === 'source') {
        setOpenSourcePanel(!openSourcePanel);
        setOpenTargetPanel(false);
      }
      if (type === 'target') {
        setOpenTargetPanel(!openTargetPanel);
        setOpenSourcePanel(false);
      }
    },
    [openSourcePanel, openTargetPanel],
  );

  const handleLangExchange = React.useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }, [sourceLang, targetLang]);

  const [openResult, setOpenResult] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleTranslate = React.useCallback(
    async (_text?: string) => {
      const sourceText = _text || text;
      console.log('文案', sourceText);
      if (!sourceText) {
        setOpenResult(false);
        setTranslateText('');
        return;
      }
      if (openSourcePanel) {
        setOpenSourcePanel(false);
      }
      if (openTargetPanel) {
        setOpenTargetPanel(false);
      }
      setLoading(true);
      setOpenResult(true);
      try {
        const transResult: string = await rTranslate(
          sourceLang.key,
          targetLang.key === 'auto' ? 'zh' : targetLang.key,
          sourceText,
        );
        setTranslateText(transResult || '');
      } catch (error) {}
      setLoading(false);
    },
    [openSourcePanel, openTargetPanel, sourceLang.key, targetLang.key, text],
  );

  const handleEnter = React.useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter' && e.keyCode !== 13) return;
      if (e.metaKey) {
        setText(`${text}\n`);
        return;
      }
      e.preventDefault();
      handleTranslate();
    },
    [handleTranslate, text],
  );

  const handleCopy = React.useCallback((msg: string) => {
    if (!msg) return;
    writeText(msg);
    toast.success('复制成功');
  }, []);

  // =========设置窗口=========
  const showSettingWindow = React.useCallback(() => {
    if (settingWindowRef.current) {
      settingWindowRef.current.show();
      return;
    }
    const settingWindow = new WebviewWindow('setting', {
      url: '#/setting',
      decorations: false,
      fullscreen: false,
      resizable: false,
      title: '偏好设置',
      transparent: true,
      visible: true,
      focus: true,
      hiddenTitle: true,
      width: 480,
      height: 320,
      alwaysOnTop: true,
    });
    settingWindowRef.current = settingWindow;
  }, []);

  return (
    <Wrapper>
      <div className="toolbar flex items-center justify-between" data-tauri-drag-region>
        <div className="left flex items-center">
          <span>Z.E.U.S</span>
          <span>Beta</span>
        </div>
        <div className="right flex items-center">
          {/* <span className="i-carbon-time" title="历史记录" /> */}
          <span className="i-carbon-settings" onClick={() => showSettingWindow()} title="偏好设置" />
          <span className="i-carbon-close-large icon" onClick={() => appWindow.hide()} title="关闭窗口" />
        </div>
      </div>
      <main>
        <Scrollbar>
          {/* 输入原文 */}
          <div className="original">
            <textarea
              value={text}
              rows={5}
              placeholder="请输入单词或句子"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleEnter}
            />
            <div className="option-bar flex items-center justify-end">
              {/* <span className="i-carbon-volume-up icon" title="朗读" /> */}
              <span className="i-carbon-copy icon" title="复制" onClick={() => handleCopy(text)} />
              <span
                className="i-carbon-ibm-watson-language-translator icon"
                title="翻译"
                onClick={() => handleTranslate()}
              />
            </div>
          </div>
          {/* 选择两侧语言类型 */}
          <div className="language-select">
            <div className="header flex items-center justify-around">
              <div className="flex items-center justify-center" onClick={() => handleLangPanel('source')}>
                <span>{sourceLang.name}</span>
                <span className={cls('i-carbon-chevron-left', { open: openSourcePanel })} />
              </div>
              <div className="flex items-center justify-center" onClick={handleLangExchange}>
                <span className="i-carbon-arrows-horizontal" />
              </div>
              <div className="flex items-center justify-center" onClick={() => handleLangPanel('target')}>
                <span>{targetLang.name}</span>
                <span className={cls('i-carbon-chevron-left', { open: openTargetPanel })} />
              </div>
            </div>
            <Accordion open={openSourcePanel}>
              <div className="content flex items-center justify-start">
                {LanguageList.map((lang) => (
                  <div
                    className={cls('flex items-center', {
                      open: sourceLang.key === lang.key,
                      disabled: targetLang.key === lang.key,
                    })}
                    key={lang.key}
                    onClick={() => setSourceLang(lang)}
                  >
                    <span>{lang.name}</span>
                    {sourceLang.key === lang.key && <span className="i-carbon-checkmark" />}
                  </div>
                ))}
              </div>
            </Accordion>
            <Accordion open={openTargetPanel}>
              <div className="content flex items-center justify-start">
                {LanguageList.map((lang) => (
                  <div
                    className={cls('flex items-center', {
                      open: targetLang.key === lang.key,
                      disabled: sourceLang.key === lang.key,
                    })}
                    key={lang.key}
                    onClick={() => setTargetLang(lang)}
                  >
                    <span>{lang.name}</span>
                    {targetLang.key === lang.key && <span className="i-carbon-checkmark" />}
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
          {/* 翻译结果 */}
          <div className="result-panel">
            <div className="header flex items-center justify-between">
              <span>翻译结果</span>
              <span
                className={`i-carbon-chevron-left ${openResult ? 'open' : ''}`}
                onClick={() => setOpenResult(!openResult)}
              />
            </div>
            <Accordion open={!!openResult}>
              <>
                {loading && (
                  <div className="loading flex items-center justify-center">
                    <IconSpin />
                  </div>
                )}
                {!loading && translateText && <div className="content">{translateText}</div>}
                {!loading && !translateText && <div className="empty">{text ? '啊呜~ 出错啦' : '没有需翻译内容'}</div>}
                {translateText && (
                  <div className="footer flex items-center justify-end">
                    {/* <span className="i-carbon-volume-up icon" title="朗读" /> */}
                    <span className="i-carbon-copy icon" title="复制" onClick={() => handleCopy(translateText)} />
                  </div>
                )}
              </>
            </Accordion>
          </div>
        </Scrollbar>
      </main>
    </Wrapper>
  );
}

export default App;
