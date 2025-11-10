
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg animate-fade-in" role="alert">
      <strong className="font-bold">An error occurred: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};