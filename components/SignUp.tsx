import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

// Simple hash function for passwords
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  
  const { signup, showToast } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let answer = 0;

    if (operator === '-') {
      if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure result is not negative
      answer = num1 - num2;
    } else if (operator === '+') {
      answer = num1 + num2;
    } else { // multiplication
      num1 = Math.floor(Math.random() * 8) + 2; // smaller numbers for multiplication
      num2 = Math.floor(Math.random() * 8) + 2;
      answer = num1 * num2;
    }
    setCaptcha({ num1, num2, operator, answer });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      showToast('Incorrect CAPTCHA answer.', 'error');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }
    const success = signup(username, email, simpleHash(password));
    if (success) {
      navigate('/');
    } else {
        generateCaptcha();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-glass-gradient backdrop-blur-2xl rounded-3xl shadow-2xl border border-glass-border">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Join WebFree</h1>
                <p className="text-gray-400">Start your journey today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all" placeholder="johndoe" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all" placeholder="name@example.com" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all" placeholder="••••••••" />
                </div>
                
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Security Check</label>
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/10 px-4 py-2 rounded-lg font-mono text-lg text-accent font-bold select-none tracking-widest">
                            {`${captcha.num1} ${captcha.operator} ${captcha.num2}`}
                        </div>
                        <span className="text-gray-400 font-bold">=</span>
                        <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" placeholder="?" />
                    </div>
                </div>

                <button type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-accent to-red-600 hover:from-accent-hover hover:to-red-700 rounded-xl shadow-lg shadow-accent/20 text-white font-bold tracking-wide transform hover:scale-[1.02] transition-all duration-200 mt-4">
                Sign Up
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-accent hover:text-white transition-colors">
                Log in
                </Link>
            </p>
        </div>
    </div>
  );
};

export default SignUp;