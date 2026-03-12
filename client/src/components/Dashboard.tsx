import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LogOut, Cloud, Bell, MapPin, Menu, X } from 'lucide-react';
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

useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const response = await API.get('/user/profile');
            setUserProfile(response.data);
            console.log("Profile updated:", response.data.homeCity);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // Re-fetch profile every time the user navigates to the home view
    if (pathname.includes('/home')) {
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
        <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row font-sans">
            
            {/* --- MOBILE TOP BAR --- */}
            <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                    <Cloud size={24} /> WeatherMan
                </h1>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* --- SIDEBAR (Desktop: Fixed | Mobile: Overlay) --- */}
            <aside className={`
                w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col fixed h-full z-40
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <h1 className="hidden lg:flex text-2xl font-bold text-blue-400 mb-10 items-center gap-2">
                    <Cloud /> WeatherMan
                </h1>
                
                <nav className="flex-1 space-y-4 mt-20 lg:mt-0">
                    <Link 
                        to="/dashboard/home" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${pathname.includes('/home') ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                        <MapPin size={20} /> Dashboard
                    </Link>
                    <Link 
                        to="/dashboard/settings" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${pathname.includes('/settings') ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                        <Bell size={20} /> Settings
                    </Link>
                </nav>

                <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all mt-auto">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* --- MOBILE OVERLAY (Darkens screen when menu is open) --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
                <Routes>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={
                        <WeatherView 
                            advice={adviceCached[currentCity] || "Loading advice..."}
                            adviceLoading={adviceLoading}
                            homeCity={userProfile?.homeCity || ''}
                        />} 
                    />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default Dashboard;