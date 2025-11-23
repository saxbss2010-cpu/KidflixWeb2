
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const Toast: React.FC = () => {
  const { toast } = useContext(AppContext);

  if (!toast) return null;

  const baseClasses = "fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300";
  const typeClasses = toast.type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {toast.message}
    </div>
  );
};

export default Toast;
