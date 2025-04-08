import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface GlobalContextProps {
    isDarkMode: boolean;
    theme: Theme;
    toggleDarkMode: () => void;
}

interface Theme {
    background: string;
    cardBackground: string;
    text: string;
    toggleBackground: string;
    headerBackground: string;
  }

  
const lightTheme: Theme = {
    background: "#F8F9FA",
    cardBackground: "#E3F2FD",
    text: "#212529",
    toggleBackground: "#FFD700",
    headerBackground: "#BBDEFB",
  };
  
  const darkTheme: Theme = {
    background: "#070F2B", 
    cardBackground: "#1B1A55",
    text: "#e0e0e0",
    toggleBackground: "#6A5ACD",
    headerBackground: "#282A36",
  };

  const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

  export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const theme = isDarkMode ? darkTheme : lightTheme;
  
  
    return (
      <GlobalContext.Provider value={{ isDarkMode, theme, toggleDarkMode }}>
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