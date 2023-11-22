import { motion } from 'framer-motion';
import React, { PropsWithChildren } from 'react';

interface AccordionProps extends PropsWithChildren {
  open: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ open, children }) => {
  const accordionVariants = {
    open: { height: 'auto' },
    closed: { height: 0 },
  };

  const contentVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  return (
    <motion.div
      variants={accordionVariants}
      initial="closed"
      animate={open ? 'open' : 'closed'}
      style={{ overflow: 'hidden' }}
    >
      <motion.div variants={contentVariants}>{children}</motion.div>
    </motion.div>
  );
};

export default Accordion;
