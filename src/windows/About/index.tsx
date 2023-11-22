import { Official_Web_Url } from '@/common/constants';
import { openUrlByDefaultBrowser } from '@/utils';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 320px;
  height: 420px;
  img {
    margin-top: 40px;
    width: 100px;
    height: 100px;
    cursor: pointer;
  }
  h1 {
    margin: 10px 0 20px;
    font-size: 24px;
    font-weight: 300;
    color: #595959;
    cursor: pointer;
    small {
      font-size: 12px;
    }
  }
  h2 {
    margin: 10px 0 30px;
    font-size: 16px;
    color: #595959;
  }
  p {
    margin: 10px 0;
    font-size: 14px;
    color: #7c7c7c;
  }
`;

const About = () => {
  return (
    <Wrapper className="flex flex-col items-center">
      <img
        className="logo"
        src={require('@/assets/logo.svg')}
        alt="logo"
        onClick={() => openUrlByDefaultBrowser(Official_Web_Url)}
      />
      <h1 onClick={() => openUrlByDefaultBrowser(Official_Web_Url)}>
        <small>v0.0.4</small>
      </h1>
      <h2>一款小巧且精美的划词翻译软件</h2>
      <p>
        官网：<a>https://fy.kai-tools.com/</a>
      </p>
      <p>开发者邮箱：kevin_captain@163.com</p>
      <p>QQ群：516308223</p>
    </Wrapper>
  );
};

export default About;
