/* eslint-disable object-curly-spacing */
import * as React from 'react';
import { styled } from 'styled-components';
import { invoke } from '@tauri-apps/api/tauri';

const Wrapper = styled.div`
  overflow: hidden;
  padding-bottom: 10px;
  min-height: 264px;
  max-height: 720px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #d8dee4;
  > div {
    margin: 10px 12px;
    padding: 8px 10px;
    border-radius: 6px;
  }
  .toolbar {
    padding-top: 10px;
    cursor: move;
    .right {
      gap: 10px;
    }
  }
  .original {
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
      > div {
        width: 30%;
        span + span {
          margin-left: 10px;
        }
      }
    }
  }
  .result-panel {
    background-color: #f6f8fa;
    .header {
      font-size: 14px;
      line-height: 20px;
      height: 20px;
    }
    .content {
      font-size: 14px;
      line-height: 20px;
      margin: 10px 0;
    }
    .footer {
      gap: 10px;
      height: 20px;
    }
  }
`;

function App() {
  const [text, setText] = React.useState<string>('生活不止眼前的苟且，还有明天和后天的苟且');
  const [translateText, setTranslateText] = React.useState<string>('');

  const handleTranslate = React.useCallback(async () => {
    invoke('alibaba_transform', {
      source: 'en',
      target: 'zh',
      text: 'With all the moving pieces in Tauri, you may run into a problem that requires debugging. There are many locations where error details are printed, and Tauri includes some tools to make the debugging process more straightforward.',
    }).then((res) => console.log(res));
    if (!text) return;
  }, [text, translateText]);

  return (
    <Wrapper>
      <div className="toolbar flex items-center justify-between" data-tauri-drag-region>
        <div className="left flex">Z.E.U.S</div>
        <div className="right flex items-center">
          <span className="i-carbon-time" title="历史记录" />
          <span className="i-carbon-settings" title="设置" />
        </div>
      </div>
      <div className="original">
        <textarea value={text} rows={4} placeholder="请输入单词或句子" onChange={(e) => setText(e.target.value)} />
        <div className="option-bar flex items-center justify-end">
          <span className="i-carbon-volume-up" title="朗读" />
          <span className="i-carbon-copy" onClick={handleTranslate} title="复制" />
        </div>
      </div>
      <div className="language-select">
        <div className="header flex items-center justify-center">
          <div className="flex items-center justify-center">
            <span>自动识别</span>
            <span className="i-carbon-chevron-left" />
          </div>
          <div className="flex items-center justify-center">
            <span className="i-carbon-arrows-horizontal" />
          </div>
          <div className="flex items-center justify-center">
            <span>自动识别</span>
            <span className="i-carbon-chevron-left" />
          </div>
        </div>
        {/* <div className="content">
          <div>
            <span>英语</span>
          </div>
        </div> */}
      </div>
      <div className="result-panel">
        <div className="header flex items-center justify-between">
          <span>本地机翻</span>
          <span className="i-carbon-chevron-left" />
        </div>
        {translateText && (
          <>
            <div className="content">{translateText}</div>
            <div className="footer flex items-center justify-end">
              <span className="i-carbon-volume-up" title="朗读" />
              <span className="i-carbon-copy" title="复制" />
            </div>
          </>
        )}
      </div>
      {/* <div className="result-panel">
        <div className="header flex items-center justify-between">
          <span>谷歌翻译</span>
          <span className="i-carbon-chevron-left" />
        </div>
        <div className="content">翻译内容xxxxxxx</div>
        <div className="footer flex items-center justify-end">
          <span className="i-carbon-volume-up" title="朗读" />
          <span className="i-carbon-copy" title="复制" />
        </div>
      </div>
      <div className="result-panel">
        <div className="header flex items-center justify-between">
          <span>腾讯翻译</span>
          <span className="i-carbon-chevron-left" />
        </div>
        <div className="content">翻译内容xxxxxxx</div>
        <div className="footer flex items-center justify-end">
          <span className="i-carbon-volume-up" title="朗读" />
          <span className="i-carbon-copy" title="复制" />
        </div>
      </div> */}
    </Wrapper>
  );
}

export default App;
