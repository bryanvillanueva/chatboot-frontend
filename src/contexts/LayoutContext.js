import React, { createContext, useContext } from 'react';

const LayoutContext = createContext({
  drawerWidth: 320,
  isDrawerExpanded: true,
  hideNavbar: false
});

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children, value }) => {
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;