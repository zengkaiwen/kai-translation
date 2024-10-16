/* eslint-disable object-curly-spacing */
import * as React from 'react';
import { styled } from 'styled-components';
import { useMount, useUnmount } from 'ahooks';
import { LogicalSize, appWindow, WebviewWindow, getAll } from '@tauri-apps/api/window';
import { writeText } from '@tauri-apps/api/clipboard';
import cls from 'classnames';
import { toast } from 'react-hot-toast';

import { LanguageList, Official_Web_Url, TLanguage, TLanguageItem, Translate_Window } from '@/common/constants';
import Accordion from '@/components/Accordion/index.tsx';
import IconSpin from '@/components/IconSpin/index.tsx';
import { getTextLang, openUrlByDefaultBrowser, rConsoleLog } from '@/utils';
import Scrollbar from '@/components/Scrollbar/index.tsx';
import useUnderlineTranslate from './_hook/useUnderlineTranslate';
import { listen } from '@tauri-apps/api/event';
import { SystemTrayPayload } from '@/common/systemtray.ts';
import useSettingConfig from '@/hooks/useSettingConfig.ts';
import { GlobalEvent } from '@/common/event';
import { Setting } from '@/utils/settings';
import useWindowVisible from './_hook/useWindowHide';
import { useAtom, useAtomValue } from 'jotai';
import { innerPlan, mainLanguage, subLanguage, windowFixed } from '@/store/setting';
import { AlibabaInnerTranslate, HuoshanInnterTranslate, DeeplInnerTranslate } from '@/services/innerTranslate';
import useEnterTranslate from './_hook/useEnterTranslate';

const alibabaInnerTranslate = new AlibabaInnerTranslate();
const huoshanInnerTranslate = new HuoshanInnterTranslate();
const deeplInnterTranslate = new DeeplInnerTranslate();

const Wrapper = styled.div`
  overflow: hidden;
  min-height: ${Translate_Window.minHeight}px;
  max-height: ${Translate_Window.maxHeight}px;
  background-color: ${(props) => props.theme.bgPrimary};
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.linePrimary};
  color: ${(props) => props.theme.textPrimary};
  transition: all 0.3s ease-in-out;

  .toolbar {
    padding: 12px 22px;
    cursor: grab;
    .left {
      cursor: pointer;
      gap: 8px;
      svg {
        width: 34.35px;
        height: 20px;
        fill: ${(props) => props.theme.textPrimary};
      }
      span {
        padding: 4px 6px;
        background-color: ${(props) => props.theme.themePrimary};
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
    background-color: ${(props) => props.theme.textPrimary};
    color: ${(props) => props.theme.textPrimary};
    &:hover {
      background-color: ${(props) => props.theme.themePrimary};
      color: ${(props) => props.theme.themePrimary};
    }
    &.active {
      background-color: ${(props) => props.theme.themePrimary};
      color: ${(props) => props.theme.themePrimary};
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
      background-color: ${(props) => props.theme.bgSecond};
      transition: all 0.3s ease-in-out;
      textarea {
        margin: 0;
        padding: 0;
        width: 100%;
        border: none;
        resize: none;
        font-size: 13px;
        line-height: 20px;
        color: ${(props) => props.theme.textPrimary};

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
          color: ${(props) => props.theme.textColorFourth};
          transition: all 0.3s ease-in-out;
        }
        &:focus {
          outline: none;
        }
        height: auto;
        &::-webkit-scrollbar {
          display: none;
        }
      }
      .option-bar {
        margin-top: 10px;
        gap: 10px;
      }
      .whatlang {
        padding: 0 10px;
        height: 18px;
        border-radius: 10px;
        border: 1px solid ${(props) => props.theme.themePrimary};
        color: ${(props) => props.theme.themePrimary};
        font-size: 10px;
        line-height: 18px;
      }
    }
    .language-select {
      margin: 10px 12px;
      border-radius: 6px;
      font-size: 14px;
      background-color: ${(props) => props.theme.bgSecond};
      transition: all 0.3s ease-in-out;
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
        border-top: 1px solid ${(props) => props.theme.lineSecond};
        flex-wrap: wrap;
        > div {
          margin: 4px 4px;
          padding: 4px 8px;
          font-size: 12px;
          line-height: 14px;
          background-color: ${(props) => props.theme.bgThird};
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          &:hover {
            background-color: ${(props) => props.theme.bgFour};
          }
          &.active {
            background-color: ${(props) => props.theme.bgFour};
          }
          &.disabled {
            pointer-events: none;
            cursor: not-allowed;
            color: ${(props) => props.theme.disabled};
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
      background-color: ${(props) => props.theme.bgSecond};
      transition: all 0.3s ease-in-out;
      .header {
        padding: 8px 10px;
        font-size: 14px;
        line-height: 20px;
      }
      .content {
        padding: 18px 10px 8px;
        border-top: 1px solid ${(props) => props.theme.lineSecond};
        font-size: 14px;
        line-height: 20px;
        color: ${(props) => props.theme.textPrimary};
      }
      .loading {
        min-height: 56px;
      }
      .empty {
        padding: 8px 10px;
        border-top: 1px solid ${(props) => props.theme.lineSecond};
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        color: ${(props) => props.theme.textFour};
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

const IconKai: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg version="1.1" width="331" height="289" viewBox="0 0 331 289" {...props}>
      <g>
        <path d="M111,89.6L130.092,116.462L75.48,155.756L129.426,225.02L103.23,245L54.834,183.284L54.834,245L4.44,245L4.44,89.6L54.834,89.6L54.834,129.782L111,89.6ZM258.63,134L258.63,245L231.99,245L231.99,235.898L140.97,245L140.97,134L258.63,134ZM191.364,160.64L191.364,213.254L231.99,209.258L231.99,160.64L191.364,160.64ZM323.454,121.346L273.06,121.346L273.06,89.6L323.454,89.6L323.454,121.346ZM323.454,245L273.06,245L273.06,134L323.454,134L323.454,245Z" />
      </g>
    </svg>
  );
};

function App() {
  const [atomWindowFixed, setAtomWindowFixed] = useAtom(windowFixed);
  const atomMainLanguage = useAtomValue(mainLanguage);
  const atomSubLanguage = useAtomValue(subLanguage);
  const atomInnerPlan = useAtomValue(innerPlan);

  const settingWindowRef = React.useRef<WebviewWindow | null>(null);
  const translateFnRef = React.useRef<(t?: string) => void>();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const { loadSettings } = useSettingConfig();

  // =================================
  // 监听划词翻译快捷键，当有文本变动时，触发
  // =================================
  useUnderlineTranslate((copyText) => {
    setText(copyText);
    translateFnRef.current?.(copyText);
  });

  // =================================
  // 监听输入翻译快捷键，当窗口出现后，设置focus
  // =================================
  useEnterTranslate(() => {
    rConsoleLog('窗口出现');
    inputRef.current?.focus();
  });

  // =================================
  // 监听窗口自动关闭，当窗口关闭时，清空原文
  // =================================
  useWindowVisible(() => {
    // rConsoleLog('隐藏窗口');
    setText('');
    setTranslateText('');
    setOpenResult(false);
    setWhatLang(undefined);
  });

  useMount(() => {
    // 将body元素添加到观察者中
    observer.observe(document.body);

    // 监听 systemTray 输入翻译指令
    listen(GlobalEvent.SYSTEM_TRAY_ITEM_CLICK, (event) => {
      const { id } = event.payload as SystemTrayPayload;
      rConsoleLog(`systemTray item click, id: ${id}`);
      switch (id) {
        case 'show':
          appWindow.show();
          break;
        case 'setting':
          showSettingWindow();
          break;
        case 'about':
          showAboutWindow();
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
  const [targetLang, setTargetLang] = React.useState<TLanguageItem>(LanguageList[0]);
  const [openSourcePanel, setOpenSourcePanel] = React.useState<boolean>(false);
  const [openTargetPanel, setOpenTargetPanel] = React.useState<boolean>(false);
  const [whatLang, setWhatLang] = React.useState<TLanguageItem>();

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

  /**
   * 获取本次翻译的原始与目标语言类型
   */
  const sourceTargetLang = React.useCallback(
    async (_sourceText: string): Promise<[TLanguage, TLanguage]> => {
      const sourceL = await getTextLang(_sourceText);
      // 识别出来了，且是主语言，当目标语言是自动的话，目标语言设置成副语言
      if (sourceL !== 'auto' && sourceL === atomMainLanguage && targetLang.key === 'auto') {
        return [sourceL, atomSubLanguage];
      }
      // 识别出来了，且不是主语言，目标语言为自动的话，目标语言设置成主语言
      if (sourceL !== 'auto' && sourceL !== atomMainLanguage && targetLang.key === 'auto') {
        return [sourceL, atomMainLanguage];
      }
      if (targetLang.key === 'auto') {
        return [sourceLang.key, atomMainLanguage];
      }
      return [sourceLang.key, targetLang.key];
    },
    [atomMainLanguage, atomSubLanguage, sourceLang.key, targetLang.key],
  );

  const doTranslate = React.useCallback(
    async (source: TLanguage, target: TLanguage, text: string) => {
      let engineList = [huoshanInnerTranslate, alibabaInnerTranslate, deeplInnterTranslate];
      if (atomInnerPlan === 'accuracy') {
        engineList = [deeplInnterTranslate, huoshanInnerTranslate, alibabaInnerTranslate];
      }
      let res = '';
      for (let engine of engineList) {
        res = await engine.translate({ source, target, text });
        if (res) {
          break;
        }
      }
      return res;
    },
    [atomInnerPlan],
  );
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
      const [sourceLang, targetLang] = await sourceTargetLang(sourceText);
      const _whatLang = LanguageList.find((item) => item.key === sourceLang);
      setWhatLang(_whatLang);
      console.log('sourceLang, targetLang', sourceLang, targetLang);
      try {
        const translateResult = await doTranslate(sourceLang, targetLang, sourceText);
        setTranslateText(translateResult);
      } catch (error) {}
      setLoading(false);
    },
    [doTranslate, openSourcePanel, openTargetPanel, sourceTargetLang, text],
  );
  React.useEffect(() => {
    translateFnRef.current = handleTranslate;
  }, [handleTranslate]);

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
      width: 600,
      height: 480,
      alwaysOnTop: true,
    });
    settingWindowRef.current = settingWindow;
  }, []);

  // ==============
  // 打开关于窗口
  // ==============
  const showAboutWindow = React.useCallback(() => {
    const allWindow = getAll();
    const aboutWindow = allWindow.find((item) => item.label === 'about');
    if (aboutWindow) {
      aboutWindow.show();
      aboutWindow.setFocus();
      return;
    }
    new WebviewWindow('about', {
      url: '#/about',
      fullscreen: false,
      resizable: false,
      title: '关于',
      transparent: false,
      visible: true,
      focus: true,
      width: 320,
      height: 420,
    });
  }, []);

  return (
    <Wrapper>
      <div className="toolbar flex items-center justify-between" data-tauri-drag-region>
        <div className="left flex items-center" onClick={() => openUrlByDefaultBrowser(Official_Web_Url)}>
          <IconKai />
          <span>Beta</span>
        </div>
        <div className="right flex items-center">
          {/* <span className="i-carbon-time" title="历史记录" /> */}
          <span className="i-carbon-settings" onClick={() => showSettingWindow()} title="偏好设置" />
          {atomWindowFixed ? (
            <span
              className="i-carbon-pin-filled icon active"
              onClick={() => setAtomWindowFixed(false)}
              title="窗口释放"
            />
          ) : (
            <span className="i-carbon-pin icon" onClick={() => setAtomWindowFixed(true)} title="窗口固定" />
          )}
        </div>
      </div>
      <main>
        <Scrollbar>
          {/* 输入原文 */}
          <div className="original">
            <textarea
              ref={inputRef}
              value={text}
              rows={5}
              placeholder="请输入单词或句子"
              onChange={(e) => {
                setText(e.target.value);
                if (whatLang) {
                  setWhatLang(undefined);
                }
              }}
              onKeyDown={handleEnter}
            />
            <div className="option-bar flex items-center justify-end">
              {sourceLang.key === 'auto' && whatLang && whatLang.key !== 'auto' && (
                <div className="whatlang">{whatLang.name}</div>
              )}
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
                      disabled: targetLang.key === lang.key && lang.key !== 'auto',
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
                      disabled: sourceLang.key === lang.key && lang.key !== 'auto',
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
                {!loading && translateText && (
                  <div className="content" dangerouslySetInnerHTML={{ __html: translateText }} />
                )}
                {!loading && !translateText && (
                  <div className="empty">{text ? '啊呜~ 出错啦，再试一下呢' : '没有需要翻译的内容~'}</div>
                )}
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
