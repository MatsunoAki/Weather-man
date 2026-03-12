import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Cloud, Thermometer, Droplets, Wind, Search } from 'lucide-react';
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

const WeatherView = ( {advice, adviceLoading, homeCity} : WeatherViewProps) => {
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


    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchCity.trim() === "") return;
        navigate(`/dashboard/home?city=${encodeURIComponent(searchCity)}`);
        setSearchCity(searchCity);
    };

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Welcome back!</h2>
                    <p className="text-slate-400">Current situation in {weatherData?.city || currentCity}.</p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                    <input 
                        type="text" 
                        placeholder="Search city..." 
                        className="w-full bg-slate-900 border border-slate-800 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
                </form>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="lg:col-span-2 h-64 bg-slate-900 animate-pulse rounded-3xl" />
                ) : (
                    <div className="lg:col-span-2 bg-linear-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <Cloud className="absolute -right-10 -top-10 text-white/10" size={250} />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-6xl font-bold mb-2">{Math.round(weatherData?.temperature ?? 0)}°C</h3>
                                <p className="text-xl font-medium capitalize">{weatherData?.conditions}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
                                <div className="flex items-center gap-2">
                                    <Droplets size={18} className="text-blue-200" />
                                    <span>Humidity 75%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wind size={18} className="text-blue-200" />
                                    <span>12 km/h</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Thermometer size={18} className="text-blue-200" />
                                    <span>RealFeel {Math.round((weatherData?.temperature ?? 0) - 2)}°</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${adviceLoading ? 'bg-blue-400' : 'bg-emerald-400'} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${adviceLoading ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                        </div>
                    </div>
                    <h4 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <span className="bg-blue-500/20 p-1.5 rounded-lg text-blue-400">✨</span>
                        AI Weather Insight
                    </h4>
                    {adviceLoading ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-800 rounded-sm animate-pulse w-full"></div>
                            <div className="h-4 bg-slate-800 rounded-sm animate-pulse w-5/6"></div>
                        </div>
                    ) : (
                        <p className="text-slate-300 text-sm leading-relaxed italic">"{advice}"</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default WeatherView;