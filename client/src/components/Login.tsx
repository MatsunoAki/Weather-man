import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { CloudSun, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard/home', { replace: true });
    }
    }, [navigate]);

    const token = localStorage.getItem('token');
    if (token) {
        return null;
    }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      
      // Save the JWT Token to LocalStorage
      localStorage.setItem('token', response.data.token);
      alert("Login Successful!");
      window.location.href = '/dashboard/home';

      //for dashboard later

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message: string }>;
        setError(axiosError.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

    return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-blue-900 p-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
            <div className="flex flex-col items-center mb-8">
            <CloudSun size={50} className="text-blue-400 mb-2" />
            <h2 className="text-3xl font-bold text-white">WeatherMan</h2>
            <p className="text-blue-200/60 text-sm">Personalized AI Forecasts</p>
            </div>
            
            {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-blue-300/50" size={18} />
                <input 
                type="email" 
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-blue-300/50" size={18} />
                <input 
                type="password" 
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>

            <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
            >
                Sign In
            </button>
            </form>

            <p className="text-center text-blue-200/50 mt-6 text-sm">
            Don't have an account? <span className="text-blue-400 hover:underline cursor-pointer font-medium">Create one</span>
            </p>
        </div>
        </div>
    );
};

export default Login;