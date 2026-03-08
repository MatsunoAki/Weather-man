import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Cloud, Bell, MapPin } from 'lucide-react';
import WeatherView from './WeatherView';
import Settings from './Settings';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    if (!localStorage.getItem('token')) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col fixed h-full">
                <h1 className="text-2xl font-bold text-blue-400 mb-10 flex items-center gap-2">
                    <Cloud /> WeatherMan
                </h1>
                <nav className="flex-1 space-y-4">
                    <button 
                        onClick={() => setActiveTab("dashboard")} 
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                        <MapPin size={20} /> Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab("settings")} 
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                        <Bell size={20} /> Settings
                    </button>
                </nav>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all mt-auto">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content - Added margin-left to offset fixed sidebar */}
            <main className="flex-1 ml-64 p-8">
                {activeTab === "dashboard" ? <WeatherView /> : <Settings />}
            </main>
        </div>
    );
};

export default Dashboard;