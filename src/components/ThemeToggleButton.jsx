import { useState, useEffect } from "react";

const ThemeToggleButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      setIsDarkMode(false);
    }
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
    const newTheme = !isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark", !isDarkMode); 
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-colors"
    >
      {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
};

export default ThemeToggleButton;
