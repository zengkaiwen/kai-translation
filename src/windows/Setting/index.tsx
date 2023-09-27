import styled from 'styled-components';
import { appWindow } from '@tauri-apps/api/window';

const Wrapper = styled.div`
  width: 480px;
  height: 320px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  background-color: #ffffff;

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
`;

const Setting = () => (
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
  </Wrapper>
);

export default Setting;
