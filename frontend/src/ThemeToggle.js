import React from 'react';
import { useTheme } from './ThemeContext';

// Small toggle button. Click to switch between dark and bluish light themes.
const ThemeToggle = () => {
	const { theme, setSpecificTheme, mounted } = useTheme();

	if (!mounted) return null;

	const isLight = theme === 'light';

	const handleToggle = () => {
		setSpecificTheme(isLight ? 'dark' : 'light');
	};

	return (
		<button
			className="theme-toggle theme-toggle-button"
			onClick={handleToggle}
			aria-pressed={isLight}
			aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
			title={isLight ? 'Active: Light — click to return to Dark' : 'Switch to Light theme'}
		>
			{isLight ? '🌙 Dark Mode' : '☀️ Light Mode'}
		</button>
	);
};

export default ThemeToggle;