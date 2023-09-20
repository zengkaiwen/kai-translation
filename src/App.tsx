/* eslint-disable object-curly-spacing */
import * as React from 'react';
import { styled } from 'styled-components';
import { useMount, useUnmount } from 'ahooks';
import { invoke } from '@tauri-apps/api/tauri';
import { LogicalSize, appWindow } from '@tauri-apps/api/window';
import cls from 'classnames';
import copy from 'copy-to-clipboard';
import { LanguageList, TLanguageItem } from './common/constants';
import Accordion from './components/Accordion';
import IconSpin from './components/IconSpin';

const Wrapper = styled.div`
  overflow: hidden;
  padding-bottom: 10px;
  min-height: 264px;
  max-height: 720px;
  background-color: #ffffff;
  border-radius: 10px;
  > div {
    margin: 10px 12px;
    border-radius: 6px;
  }
  .toolbar {
    padding: 8px 10px;
    cursor: move;
    .right {
      gap: 10px;
    }
  }
  .icon {
    background-color: #787878;
    color: #787878;
    &:hover {
      background-color: #232323;
      color: #232323;
    }
  }
  .original {
    padding: 8px 10px;
    background-color: #f6f8fa;
    textarea {
      margin: 0;
      padding: 0;
      width: 100%;
      border: none;
      resize: none;
      font-size: 12px;
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
      gap: 10px;
    }
  }
  .language-select {
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
    background-color: #f6f8fa;
    .header {
      padding: 8px 10px;
      font-size: 14px;
      line-height: 20px;
      height: 20px;
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
  .i-carbon-chevron-left {
    transform: rotate(0deg);
    transition: all 0.3s ease-in-out;
    &.open {
      transform: rotate(-90deg);
      transition: all 0.3s ease-in-out;
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
  useMount(() => {
    // 将body元素添加到观察者中
    observer.observe(document.body);
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

  const handleTranslate = React.useCallback(async () => {
    if (!text) {
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
      const transResult: string = await invoke('alibaba_transform', {
        source: sourceLang.key,
        target: targetLang.key === 'auto' ? 'zh' : targetLang.key,
        text,
      });
      setTranslateText(transResult);
    } catch (error) {}
    setLoading(false);
  }, [openSourcePanel, openTargetPanel, sourceLang.key, targetLang.key, text]);

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
    copy(msg);
  }, []);

  return (
    <Wrapper>
      <div className="toolbar flex items-center justify-between" data-tauri-drag-region>
        <div className="left flex">Z.E.U.S</div>
        <div className="right flex items-center">
          {/* <span className="i-carbon-time" title="历史记录" />
          <span className="i-carbon-settings" title="设置" /> */}
        </div>
      </div>
      {/* 输入原文 */}
      <div className="original">
        <textarea
          value={text}
          rows={4}
          placeholder="请输入单词或句子"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleEnter}
        />
        <div className="option-bar flex items-center justify-end">
          {/* <span className="i-carbon-volume-up icon" title="朗读" /> */}
          <span className="i-carbon-copy icon" title="复制" onClick={() => handleCopy(text)} />
          <span className="i-carbon-ibm-watson-language-translator icon" title="翻译" onClick={handleTranslate} />
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
            {!loading && !translateText && <div className="empty">啊呜~ 出错啦</div>}
            <div className="footer flex items-center justify-end">
              {/* <span className="i-carbon-volume-up icon" title="朗读" /> */}
              <span className="i-carbon-copy icon" title="复制" onClick={() => handleCopy(translateText)} />
            </div>
          </>
        </Accordion>
      </div>
    </Wrapper>
  );
}

export default App;
