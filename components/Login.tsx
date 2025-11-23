
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
    <div className="max-w-md mx-auto mt-10 p-8 bg-secondary rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Login to KidFlix</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-hover transition-colors"
        >
          Login
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;