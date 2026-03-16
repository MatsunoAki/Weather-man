import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Cloud, Thermometer, Droplets, Wind, Search, MapPin, Zap, CloudSun, Loader2 } from 'lucide-react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal-dark.css';
import API from '../api/axiosConfig';

interface WeatherData {
    city: string;
    temperature: number;
    conditions: string;
}
interface WeatherViewProps {
    advice: string;
    adviceLoading: boolean;
    homeCity: string;
}

const WeatherView = ({ advice, adviceLoading, homeCity }: WeatherViewProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchCity, setSearchCity] = useState("");

    const queryParams = new URLSearchParams(location.search);
    const currentCity = queryParams.get('city') || homeCity;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchWeatherData = async () => {
            if (!currentCity || currentCity === "undefined") return;

            setLoading(true);
            try {
                const response = await API.get(`/weather/${currentCity}`);
                setWeatherData(response.data);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();
    }, [currentCity]);




    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- HEADER SECTION --- */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Welcome back!</h2>
                    <div className="flex items-center gap-2 mt-2 group cursor-default">
                        <MapPin size={14} className="text-blue-500 group-hover:animate-bounce" />
                        <p className="text-slate-400 text-sm font-medium">
                            Current situation in <span className="text-white border-b border-blue-500/30">{weatherData?.city || currentCity}</span>
                        </p>
                    </div>
                </div>

            {/* --- SEARCH COMPONENT --- */}
            <div className="relative w-full max-w-sm group z-50">
                {/* Absolute Search Icon - Positioned over the Geoapify input */}
                <Search 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-20 pointer-events-none" 
                    size={20} 
                />
                
                <div className="geoapify-custom-wrapper">
                    <GeoapifyContext apiKey={import.meta.env.VITE_GEOAPIFY_API_KEY}>
                        <GeoapifyGeocoderAutocomplete
                            placeholder="Search city..."
                            type="city"
                            lang="en"
                            limit={5}
                            placeSelect={(value) => {
                                if (value) {
                                    const cityName = value.properties.city || value.properties.name;
                                    navigate(`/dashboard/home?city=${encodeURIComponent(cityName)}`);
                                }
                            }}
                        />
                    </GeoapifyContext>
                </div>
            </div>
            </header>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Main Weather Card */}
                {loading ? (
                    <div className="lg:col-span-2 h-[380px] bg-white/5 animate-pulse rounded-[2.5rem] border border-white/5 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500/20" size={40} />
                    </div>
                ) : (
                    <div className="lg:col-span-2 bg-[#0A0C10] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        {/* Atmospheric Glow Effect */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-700"></div>
                        
                        {/* Background Floating Cloud */}
                        <Cloud className="absolute -right-10 top-10 text-white/[0.03] rotate-12 scale-150 pointer-events-none" size={300} />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-8xl font-black text-white tracking-tighter">
                                        {Math.round(weatherData?.temperature ?? 0)}°
                                    </h3>
                                    <p className="text-2xl font-semibold text-blue-400 capitalize mt-2 tracking-wide">
                                        {weatherData?.conditions}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-inner">
                                    <CloudSun size={54} className="text-white" />
                                </div>
                            </div>

                            {/* Weather Metrics */}
                            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/5">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Droplets size={16} className="text-blue-400" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Humidity</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">75%</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Wind size={16} className="text-blue-400" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Wind</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">12 km/h</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Thermometer size={16} className="text-blue-400" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Feels Like</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">
                                        {Math.round((weatherData?.temperature ?? 0) - 2)}°
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. AI Insight Card */}
                <div className="bg-[#0A0C10] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col shadow-2xl">
                    {/* Pulsing Status Dot */}
                    <div className="absolute top-8 right-8">
                        <div className="flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${adviceLoading ? 'bg-blue-400' : 'bg-emerald-400'} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${adviceLoading ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-400 shadow-inner">
                            <Zap size={22} fill="currentColor" />
                        </div>
                        <h4 className="font-bold text-white text-lg tracking-tight">AI Insights</h4>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {adviceLoading ? (
                            <div className="space-y-4">
                                <div className="h-3 bg-white/5 rounded-full animate-pulse w-full"></div>
                                <div className="h-3 bg-white/5 rounded-full animate-pulse w-5/6"></div>
                                <div className="h-3 bg-white/5 rounded-full animate-pulse w-4/6"></div>
                            </div>
                        ) : (
                            <div className="relative">
                                <span className="text-6xl text-blue-600/10 font-serif absolute -top-8 -left-4 select-none">“</span>
                                <p className="text-slate-300 text-base leading-relaxed font-medium relative z-10 italic pl-4 border-l-2 border-blue-600/30">
                                    {advice}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.3em]">Neural Engine Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherView;