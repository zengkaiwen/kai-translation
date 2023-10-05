import * as React from 'react';
import { createPortal } from 'react-dom';
import cls from 'classnames';
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion';
import Scrollbar from '../Scrollbar';
import styled from 'styled-components';
import { useClickAway } from 'ahooks';

const Wrapper = styled.div`
  position: relative;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1px solid transparent;
  transition: all 0.3s ease-in-out;
  height: 32px;
  > .inside {
    padding: 0 10px;
    min-width: 100px;
    width: max-content;
    height: 30px;
    background-color: #e5e5e5;
    overflow: hidden;
    border-radius: 6px;
    box-sizing: border-box;
    .placeholder {
      color: #7c7c7c;
      transition: all 0.3s ease-in-out;
      font-size: 12px;
    }
    .selection {
      color: #6659ea;
      font-size: 12px;
    }
    .arrow {
      fill: #595959;
      transition: all 0.3s ease-in-out;
    }
  }
  &:not(.disabled).visible {
    border: 1px solid #6659ea;
    .arrow {
      fill: #6659ea;
      transform: rotateZ(-180deg);
    }
  }
  &:not(.disabled):hover {
    border: 1px solid #6659ea;
    cursor: pointer;
  }
  &.disabled {
    background: #9e9e9e;
    user-select: none;
    cursor: not-allowed;
    transition: all 0.3s ease-in-out;
  }
`;

const Trigger = styled(motion.div)`
  /* global */
  position: absolute;
  border: 1px solid #e5e5e5;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 1;
  transition: background-color box-shadow border 0.3s ease-in-out;
  border-radius: 6px;
  max-height: 150px;
  min-width: max-content;
  background-color: #ffffff;
  .ms-container {
    width: 100%;
    max-height: 200px;
  }
  li {
    padding: 0 8px !important;
    border: none !important;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    &:hover {
      background: #e5e5e5;
    }
  }
  ul {
    min-width: 100px;
    width: 100%;
    padding: 0 !important;
    margin: 0 !important;
    background-color: #ffffff !important;
  }
`;

export interface SelectOption {
  value: any;
  label: React.ReactNode;
}

export interface SelectProps {
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  triggerWidth?: number;
  triggerHeight?: number;
  options?: SelectOption[];
  value?: SelectOption;
  onChange?: (value: SelectOption) => void;
}

interface TriggerProps extends SelectProps {
  followRef: React.RefObject<HTMLDivElement>;
  onClose: (...args: any[]) => any;
}

interface PositionProps {
  top: number;
  left?: number;
  right?: number;
  width: number | 'auto';
  height?: number;
}

export const easings = {
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
};

const fadeConfig: HTMLMotionProps<any> = {
  initial: 'exit',
  animate: 'enter',
  exit: 'exit',
  variants: {
    exit: {
      opacity: 0,
      transition: {
        duration: 0.1,
        ease: easings.easeOut,
      },
    },
    enter: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: easings.easeIn,
      },
    },
  },
};

const Portal: React.FC<TriggerProps> = (props: TriggerProps) => {
  const { followRef, triggerHeight, options, onChange, onClose } = props;

  const innerRef = React.useRef<HTMLDivElement>(null);

  const [direction, setDirection] = React.useState<PositionProps>();

  const filterPosition = React.useCallback(
    (space: DOMRect, inside: DOMRect) => {
      const { width: followWidth, height: followHeight } = space;
      const rectSize: PositionProps = {
        top: followHeight + 4,
        right: 0,
        width: followWidth,
      };
      if (triggerHeight) rectSize.height = triggerHeight;

      return rectSize;
    },
    [triggerHeight],
  );

  React.useEffect(() => {
    if (!followRef.current || !innerRef.current) return;
    const space = followRef.current.getBoundingClientRect();
    const inside = innerRef.current.getBoundingClientRect();
    const result = filterPosition(space, inside);
    setDirection(result);
  }, [followRef, innerRef, filterPosition]);

  useClickAway(() => onClose?.(), followRef);

  const selectTrigger = React.useMemo(() => {
    if (!followRef.current) return;
    return (
      <Trigger ref={innerRef} style={direction} onClick={(e) => e.stopPropagation()} {...fadeConfig}>
        <Scrollbar>
          <ul>
            {options?.map((option) => (
              <li key={option.value} className="flex items-center" onClick={() => onChange?.(option)}>
                {option.label}
              </li>
            ))}
          </ul>
        </Scrollbar>
      </Trigger>
    );
  }, [followRef, direction, options, onChange]);

  const DOM = followRef.current as HTMLElement;
  return createPortal(selectTrigger, DOM);
};

const Select: React.FC<SelectProps> = (props: SelectProps) => {
  const { className, disabled = false, placeholder, onChange, value } = props;

  const followRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState<boolean>(false);
  const [selectedOption, setSelectedOption] = React.useState<SelectOption>();
  React.useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const classes = cls(className, {
    disabled,
    visible,
  });

  // handle event
  const handleOpen: React.MouseEventHandler<HTMLDivElement> = () => {
    if (disabled) return;
    setVisible(true);
  };

  const handleClose: React.MouseEventHandler<HTMLDivElement> = () => {
    if (disabled) return;
    setVisible(false);
  };

  const handleChange = React.useCallback(
    (value: SelectOption) => {
      setSelectedOption(value);
      setVisible(false);
      onChange?.(value);
    },
    [onChange],
  );

  const memoElement = React.useMemo(() => {
    if (!selectedOption) return <span className="placeholder">{placeholder}</span>;
    return <span className="selection">{selectedOption.label}</span>;
  }, [placeholder, selectedOption]);

  return (
    <React.Fragment>
      <Wrapper className={classes} ref={followRef} onClick={handleOpen}>
        <div className="inside flex items-center justify-between">
          {memoElement}
          <span className="i-carbon-caret-down arrow" />
        </div>
      </Wrapper>
      <AnimatePresence>
        {visible && <Portal {...props} followRef={followRef} onChange={handleChange} onClose={handleClose} />}
      </AnimatePresence>
    </React.Fragment>
  );
};

export default Select;
