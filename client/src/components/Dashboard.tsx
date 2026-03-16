import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LogOut, Cloud, Menu, X, LayoutDashboard, Settings as SettingsIcon, CloudRain } from 'lucide-react';
import WeatherView from './WeatherView';
import Settings from './Settings';
import API from '../api/axiosConfig';

const Dashboard = () => {
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    const [adviceCached, setAdviceCached] = useState<Record<string, string>>({});
    const [adviceLoading, setAdviceLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<{ homeCity: string } | null>(null);
    
    const queryParams = new URLSearchParams(search);
    const currentCity = queryParams.get('city') || userProfile?.homeCity || '';

    // 🚀 SYNC FIX: Re-fetch profile when returning to Home
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await API.get('/user/profile');
                setUserProfile(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
        if (pathname.includes('/home') || !userProfile) {
            fetchUserProfile();
        }
    }, [pathname]);

    useEffect(() => {
        const fetchAdvice = async () => {
            if (!userProfile || !currentCity || adviceCached[currentCity]) return;
            setAdviceLoading(true);
            try {
                const response = await API.get(`/weather/${currentCity}/advice`);
                setAdviceCached(prev => ({ ...prev, [currentCity]: response.data.advice }));
            } catch (error) {
                console.error('Error fetching AI advice:', error);
            } finally {
                setAdviceLoading(false);
            }
        };

        if (pathname.includes('/home') && currentCity) fetchAdvice();
    }, [currentCity, pathname, userProfile, adviceCached]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    if (!localStorage.getItem('token')) return null;

    return (
        <div className="min-h-screen bg-[#05070A] text-white flex flex-col lg:flex-row font-sans relative overflow-hidden">
            
            {/* --- ATMOSPHERIC BACKGROUND (Starry + Glow) --- */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }}>
            </div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* --- MOBILE TOP BAR --- */}
            <div className="lg:hidden bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                    <CloudRain className="text-blue-400" /> WeatherMan
                </h1>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* --- SIDEBAR --- */}
            <aside className={`
                w-72 bg-[#0A0C10]/80 backdrop-blur-xl border-r border-white/5 p-8 flex flex-col fixed h-full z-40
                transition-transform duration-500 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="hidden lg:flex items-center gap-3 mb-12">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                        <Cloud className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">WeatherMan</h1>
                </div>
                
                <nav className="flex-1 space-y-2 mt-20 lg:mt-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 ml-2">Menu</p>
                    
                    <Link 
                        to="/dashboard/home" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group ${pathname.includes('/home') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                        <LayoutDashboard size={20} className={pathname.includes('/home') ? 'text-white' : 'group-hover:text-blue-400'} /> 
                        <span className="font-medium text-sm">Dashboard</span>
                    </Link>

                    <Link 
                        to="/dashboard/settings" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group ${pathname.includes('/settings') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                        <SettingsIcon size={20} className={pathname.includes('/settings') ? 'text-white' : 'group-hover:text-blue-400'} /> 
                        <span className="font-medium text-sm">Settings</span>
                    </Link>
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-all duration-300">
                        <LogOut size={20} /> 
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* --- MOBILE OVERLAY --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 lg:ml-72 p-6 md:p-10 w-full max-w-full overflow-x-hidden relative z-10">
                <div className="max-w-6xl mx-auto">
                    <Routes>
                        <Route index element={<Navigate to="home" replace />} />
                        <Route path="home" element={
                            <WeatherView 
                                advice={adviceCached[currentCity] || "Analyzing weather patterns..."}
                                adviceLoading={adviceLoading}
                                homeCity={userProfile?.homeCity || ''}
                            />} 
                        />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;