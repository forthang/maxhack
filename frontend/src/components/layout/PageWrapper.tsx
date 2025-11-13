import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -300 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 30,
    }}
  >
    {children}
  </motion.div>
);

export default PageWrapper;
