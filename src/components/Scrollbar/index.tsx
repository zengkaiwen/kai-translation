import * as React from 'react';
import { MacScrollbar, MacScrollbarProps } from 'mac-scrollbar';
import styled from 'styled-components';
import 'mac-scrollbar/dist/mac-scrollbar.css';

const Wrapper = styled(MacScrollbar)<ScrollbarProps>`
  width: inherit;
  height: inherit;
`;

export type ScrollbarProps = MacScrollbarProps;

const Scrollbar: React.FC<ScrollbarProps> = (props: ScrollbarProps) => {
  const { as, children, ...rest } = props;

  return (
    <Wrapper
      forwardedAs={as as keyof JSX.IntrinsicElements}
      trackStyle={(horizontal?: boolean) => ({ [horizontal ? 'height' : 'width']: 0, right: 0, border: 0 })}
      thumbStyle={(horizontal?: boolean) => ({ [horizontal ? 'height' : 'width']: 3 })}
      trackGap={[4, 4, 4, 4]}
      {...rest}
    >
      {children}
    </Wrapper>
  );
};

export default Scrollbar;
