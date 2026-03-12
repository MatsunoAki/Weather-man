import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, MapPin, Bell, Zap, CheckCircle, Navigation, Search, Loader2 } from 'lucide-react';

const Settings = () => {
    const [prefs, setPrefs] = useState({
        homeCity: "",
        useGPS: false,
        morningAlert: true,
        eveningAlert: true,
        alertOnSuddenChange: true,
    });

    // Photon State - Updated interface to include location hierarchy
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState("");

    // 1. Fetch Preferences on Mount
    useEffect(() => {
        const fetchPreferences = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const response = await axios.get("http://localhost:5000/api/user/preferences", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPrefs(response.data);
                setQuery(response.data.homeCity); 
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        fetchPreferences();
    }, []);

    // 2. Photon Autocomplete Logic (Debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 3 || prefs.useGPS) {
                setSuggestions([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
                const data = await res.json();
                setSuggestions(data.features || []);
            } catch (err) {
                console.error("Geocoding error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, prefs.useGPS]);

    // 3. Handle GPS Toggle
    const handleGPSFetch = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
                const data = await res.json();
                const p = data.features[0].properties;
                // Priority: City -> District -> Name
                const city = p.city || p.district || p.name || "Unknown Location";
                
                setPrefs(prev => ({ ...prev, homeCity: city, useGPS: true }));
                setQuery(city);
            } catch (err) {
                console.error("Reverse geocode failed", err);
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put('http://localhost:5000/api/user/update-preferences', prefs, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaveSuccess('Preferences saved successfully!');
            setTimeout(() => setSaveSuccess(""), 3000);
        } catch (err) {
            setSaveSuccess('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold mb-2 text-white">App Settings</h2>
            <p className="text-slate-400 mb-8">Personalize your WeatherMan experience.</p>

            <div className="space-y-6">
                
                {/* --- GPS TOGGLE SECTION --- */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${prefs.useGPS ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Automatic Location</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-tighter">Meteored Style detection</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const newValue = !prefs.useGPS;
                            setPrefs(p => ({ ...p, useGPS: newValue }));
                            if (newValue) handleGPSFetch();
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${prefs.useGPS ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.useGPS ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                {/* --- LOCATION SEARCH SECTION --- */}
                <div className={`bg-slate-900/50 border border-slate-800 p-6 rounded-3xl transition-all ${prefs.useGPS ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                    <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={18} /> Home City
                    </h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 p-4 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                            placeholder="Search city, province, or country..."
                        />
                        <Search className="absolute left-4 top-4.5 text-slate-500" size={20} />
                        {isSearching && <Loader2 className="absolute right-4 top-4.5 animate-spin text-blue-500" size={20} />}
                        
                        {/* --- SUGGESTIONS DROPDOWN --- */}
                        {suggestions.length > 0 && (
                            <ul className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                                {suggestions.map((s, idx) => {
                                    const p = s.properties;
                                    // Identify main municipality name
                                    const mainName = p.city || p.district || p.locality || p.name;
                                    
                                    // Build hierarchy: Province/State, Country
                                    const subLabelParts = [p.state, p.country].filter(val => 
                                        val && val !== mainName
                                    );
                                    const subLabel = subLabelParts.join(", ");

                                    return (
                                        <li 
                                            key={idx}
                                            onClick={() => {
                                                setQuery(mainName);
                                                setPrefs(prev => ({ ...prev, homeCity: mainName }));
                                                setSuggestions([]);
                                            }}
                                            className="p-4 hover:bg-blue-600/20 cursor-pointer flex flex-col border-b border-slate-800 last:border-none group"
                                        >
                                            <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                                {mainName}
                                            </span>
                                            {subLabel && (
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                                    {subLabel}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                    <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2 text-white">
                        <Bell size={18} /> Notifications
                    </h3>
                    <div className="space-y-4">
                        {[
                            { id: 'morningAlert', label: 'Morning Briefing', desc: 'Advice at 7:00 AM' },
                            { id: 'eveningAlert', label: 'Evening Forecast', desc: 'Advice at 8:00 PM' },
                            { id: 'alertOnSuddenChange', label: 'Sudden Changes', desc: 'Immediate rain alerts', icon: <Zap size={12} className="text-amber-400" /> }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-2xl hover:bg-slate-800/50 transition-colors">
                                <div>
                                    <p className="font-medium flex items-center gap-2 text-white text-sm">{item.label} {item.icon}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <button 
                                    onClick={() => setPrefs({...prefs, [item.id as keyof typeof prefs]: !prefs[item.id as keyof typeof prefs]})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${prefs[item.id as keyof typeof prefs] ? 'bg-blue-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs[item.id as keyof typeof prefs] ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-white"
                >
                    {saving ? 'Processing...' : <><Save size={20} /> Save Changes</>}
                </button>

                {saveSuccess && (
                    <p className="text-center text-emerald-400 flex items-center justify-center gap-2 text-sm font-medium animate-in fade-in">
                        <CheckCircle size={16} /> {saveSuccess}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Settings;