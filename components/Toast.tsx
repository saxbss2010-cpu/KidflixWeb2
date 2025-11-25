
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { CheckCircleIcon, ExclamationCircleIcon } from './icons';

const Toast: React.FC = () => {
  const { toast } = useContext(AppContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast]);

  if (!toast && !visible) return null;

  const isSuccess = toast?.type === 'success';

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'} ${isSuccess ? 'border-emerald-500/30 bg-black/80 shadow-emerald-500/20' : 'border-red-500/30 bg-black/80 shadow-red-500/20'}`}>
        
        {/* Neon Glow Line */}
        <div className={`absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r ${isSuccess ? 'from-transparent via-emerald-500 to-transparent' : 'from-transparent via-red-500 to-transparent'} opacity-70`}></div>

        <div className={`p-2 rounded-full ${isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {isSuccess ? <CheckCircleIcon className="w-6 h-6" /> : <ExclamationCircleIcon className="w-6 h-6" />}
        </div>
        
        <div className="pr-2">
            <h4 className={`font-bold text-sm ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                {isSuccess ? 'Success' : 'Error'}
            </h4>
            <p className="text-white font-medium text-sm">
                {toast?.message}
            </p>
        </div>
    </div>
  );
};

export default Toast;
