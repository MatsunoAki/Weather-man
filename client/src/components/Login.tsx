import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            window.location.href = '/dashboard/home';
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<{ message: string }>;
                setError(axiosError.response?.data?.message || 'Login failed.');
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    if (localStorage.getItem('token')) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#05070A] relative overflow-hidden font-sans">
            {/* --- BACKGROUND PATTERN (Subtle Stars/Grid) --- */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px' }}>
            </div>

            <div className="relative w-full max-w-[380px] p-6 flex flex-col items-center">
                
                {/* --- LOGO --- */}
                <div className="mb-8 p-4 bg-blue-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    <ShieldCheck size={40} className="text-white" />
                </div>

                {/* --- HEADER --- */}
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Sign in to your</h2>
                <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Account</h2>
                
                <p className="text-slate-400 text-sm mb-10">
                    Don’t have an account? <Link to="/signup" className="text-blue-500 font-semibold hover:text-blue-400">Sign Up</Link>
                </p>

                {error && <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-xs text-center">{error}</div>}

                <form onSubmit={handleLogin} className="w-full space-y-0">
                    {/* --- STACKED INPUT CARD --- */}
                    <div className="bg-white rounded-2xl overflow-hidden mb-8 shadow-xl">
                        {/* Email Field */}
                        <div className="relative border-b border-slate-100">
                            <Mail className="absolute left-4 top-4 text-blue-600" size={20} />
                            <input 
                                type="email" 
                                placeholder="example@gmail.com"
                                className="w-full pl-12 pr-4 py-4 text-slate-900 placeholder-slate-400 outline-none text-base"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        {/* Password Field */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-blue-600" size={20} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="********"
                                className="w-full pl-12 pr-12 py-4 text-slate-900 placeholder-slate-400 outline-none text-base"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-slate-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <button type="button" className="text-slate-200 text-sm font-medium hover:underline decoration-slate-500 underline-offset-4">
                            Forgot Your Password?
                        </button>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#2563EB] hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-[0.98] text-lg"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;