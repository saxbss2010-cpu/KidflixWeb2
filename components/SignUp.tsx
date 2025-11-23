
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
    <div className="max-w-md mx-auto mt-10 p-8 bg-secondary rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Create an Account</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent focus:border-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent focus:border-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent focus:border-accent" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300">reCAPTCHA</label>
            <div className="mt-1 flex items-center space-x-4 p-3 bg-gray-800 border border-gray-600 rounded-md">
                <p className="font-mono text-lg text-white">{`${captcha.num1} ${captcha.operator} ${captcha.num2} = ?`}</p>
                <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required className="w-full bg-gray-700 border border-gray-500 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-accent focus:border-accent" />
            </div>
        </div>
        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-hover transition-colors">
          Sign Up
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
