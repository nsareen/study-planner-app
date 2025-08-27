import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getTheme } from '../utils/themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useStore();
  const currentTheme = getTheme(settings.colorTheme || 'default');

  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;
    
    // Set CSS custom properties for the theme
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-alt', theme.colors.backgroundAlt);
    root.style.setProperty('--color-card', theme.colors.card);
    root.style.setProperty('--color-card-hover', theme.colors.cardHover);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    
    // Update body classes for gradient backgrounds
    const body = document.body;
    body.className = '';
    body.classList.add(`bg-gradient-to-br`);
    
    // Apply gradient classes based on theme
    const gradientClasses = theme.gradients.background.split(' ');
    gradientClasses.forEach(cls => body.classList.add(cls));
    
    // Store gradient classes in data attributes for use in components
    root.setAttribute('data-gradient-primary', theme.gradients.primary);
    root.setAttribute('data-gradient-background', theme.gradients.background);
    root.setAttribute('data-gradient-card', theme.gradients.card);
    root.setAttribute('data-gradient-button', theme.gradients.button);
  }, [currentTheme]);

  return <>{children}</>;
};

export default ThemeProvider;