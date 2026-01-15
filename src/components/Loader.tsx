import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex justify-center items-center space-x-2 animate-pulse">
    <div className="w-2 h-2 bg-brandRed rounded-full"></div>
    <div className="w-2 h-2 bg-brandRed rounded-full"></div>
    <div className="w-2 h-2 bg-brandRed rounded-full"></div>
  </div>
);