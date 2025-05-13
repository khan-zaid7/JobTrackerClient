import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`card shadow-sm p-3 rounded ${className}`}>
      {children}
    </div>
  );
};
