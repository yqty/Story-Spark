import React from 'react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>
);

export const WandIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M13.2635 3.01139L14.0041 3.75203L15.4183 2.33782L16.159 3.07846L13.75 5.48744L11.341 3.07846L12.0817 2.33782L13.2635 3.01139ZM3.75203 14.0041L3.01139 13.2635L2.33782 12.0817L3.07846 11.341L5.48744 13.75L3.07846 16.159L2.33782 15.4183L3.75203 14.0041ZM12 8C13.6458 8 15.1111 8.81831 16 10C16.8889 11.1817 17.6458 12.8458 17.9319 14.532C19.165 14.7931 20.2069 15.835 20.468 17.0681C22.1542 17.3542 22.8183 18.1111 22 19C20.8183 18.8889 19.1542 18.3542 17.468 18.0681C17.2069 19.165 16.165 20.2069 14.9319 20.468C13.1542 22.1542 11.8889 22.8183 11 22C11.1111 20.8183 11.6458 19.1542 11.9319 17.468C10.835 17.2069 9.79312 16.165 9.53198 14.9319C7.84583 14.6458 6.18169 13.8889 5 13C5.11111 11.8183 5.64583 10.1542 6.53198 8.46802C6.79312 7.835 7.20688 7.20688 7.835 6.79312C8.46802 6.35417 9.18169 6.11111 10 6C10.8183 5.11111 11.1542 4.35417 11.2426 3.75736C11.4583 5.06812 11.6458 6.35417 12 8Z"></path></svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M15.7782 4.22183L19.7782 8.22183L8.77817 19.2218H4.77817V15.2218L15.7782 4.22183ZM17.2218 2.77817L21.2218 6.77817L19.7782 8.22183L15.7782 4.22183L17.2218 2.77817ZM6.77817 17.2218L16.7782 7.22183L12.7782 3.22183L2.77817 13.2218V18.2218C2.77817 18.7741 3.22588 19.2218 3.77817 19.2218H8.77817L6.77817 17.2218Z"></path></svg>
);