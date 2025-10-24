
import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import type { Language } from '../types';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLocalization();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const buttonClasses = (lang: Language) => 
    `px-3 py-1 text-sm rounded-md transition-colors ${
      language === lang 
        ? 'bg-brand-secondary text-white' 
        : 'bg-base-200 dark:bg-dark-300 hover:bg-base-300 dark:hover:bg-dark-200'
    }`;

  return (
    <div className="flex items-center space-x-1 p-1 bg-base-100 dark:bg-dark-200 rounded-lg">
      <button onClick={() => handleLanguageChange('en')} className={buttonClasses('en')}>
        EN
      </button>
      <button onClick={() => handleLanguageChange('zh')} className={buttonClasses('zh')}>
        中文
      </button>
    </div>
  );
};
