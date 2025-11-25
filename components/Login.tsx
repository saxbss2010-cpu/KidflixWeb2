import React, { useState, useContext } from 'react';
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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, simpleHash(password));
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-glass-gradient backdrop-blur-2xl rounded-3xl shadow-2xl border border-glass-border">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue to WebFree</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                placeholder="name@example.com"
            />
            </div>
            <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                placeholder="••••••••"
            />
            </div>
            <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-accent to-red-600 hover:from-accent-hover hover:to-red-700 rounded-xl shadow-lg shadow-accent/20 text-white font-bold tracking-wide transform hover:scale-[1.02] transition-all duration-200"
            >
            Login
            </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-accent hover:text-white transition-colors">
            Create account
            </Link>
        </p>
        </div>
    </div>
  );
};

export default Login;