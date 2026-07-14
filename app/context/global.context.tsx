'use client';

import { createContext, useContext, useState } from 'react';

interface GlobalContextType {
  droppedFiles: File[];
  setDroppedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export const GlobalContext = createContext<GlobalContextType>({
  droppedFiles: [],
  setDroppedFiles: () => {},
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  return (
    <GlobalContext.Provider value={{ droppedFiles, setDroppedFiles }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }

  return context;
};
