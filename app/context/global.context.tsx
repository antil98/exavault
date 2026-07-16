'use client';

import { createContext, useContext, useState } from 'react';

type RenamedFile = {
  id: string;
  name: string;
} | null;

interface GlobalContextType {
  droppedFiles: File[];
  setDroppedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  renamedFile: RenamedFile;
  setRenamedFile: React.Dispatch<React.SetStateAction<RenamedFile>>;
}

export const GlobalContext = createContext<GlobalContextType>({
  droppedFiles: [],
  setDroppedFiles: () => {},
  renamedFile: null,
  setRenamedFile: () => {},
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [renamedFile, setRenamedFile] = useState<RenamedFile>(null);

  return (
    <GlobalContext.Provider
      value={{
        droppedFiles,
        setDroppedFiles,
        renamedFile,
        setRenamedFile,
      }}
    >
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
