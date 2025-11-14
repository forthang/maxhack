import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  // This component can be used to add common layout, padding, etc. to each page.
  return <div className="p-4 pb-20">{children}</div>;
};

export default PageWrapper;
