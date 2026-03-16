import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Bell, Zap, CheckCircle, Navigation, Loader2, MapPin, Search, Thermometer } from 'lucide-react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal-dark.css';

const Settings = () => {
    const [prefs, setPrefs] = useState({
        homeCity: "",
        homeLat: null,
        homeLon: null,
        useGPS: false,
        morningAlert: true,
        eveningAlert: true,
        alertOnSuddenChange: true,
        tempUnit: "celsius",
        windUnit: "kmh",
        pressureUnit: "hpa",
    });

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');

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
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        fetchPreferences();
    }, []);

    // 2. Geoapifiy selection handler

    const onPlaceSelect = (value: any) => {
        if (!value || !value.properties) return;
        const p = value.properties;
        const cityName = p.city || p.name;

        setPrefs(prev => ({
            ...prev,
            homeCity: cityName,
            homeLat: p.lat,
            homeLon: p.lon,
            useGPS: false
        }));
    }
    
    // 3. Handle GPS Toggle
    const handleGPSFetch = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
                const data = await res.json();
                const p = data.features[0].properties;
                const city = p.city || p.district || p.name || "Unknown Location";
                
                setPrefs(prev => ({ ...prev, homeCity: city, useGPS: true }));
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
        } catch {
            setSaveSuccess('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <h2 className="text-4xl font-bold text-white tracking-tight">App Settings</h2>
                <p className="text-slate-400 mt-2">Personalize your WeatherMan experience.</p>
            </header>

            <div className="space-y-8">
                
                {/* --- GPS TOGGLE SECTION --- */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl backdrop-blur-sm group">
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl transition-all duration-500 ${prefs.useGPS ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-slate-500'}`}>
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Automatic Location</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Smart GPS Detection</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const newValue = !prefs.useGPS;
                            setPrefs(p => ({ ...p, useGPS: newValue }));
                            if (newValue) handleGPSFetch();
                        }}
                        className={`w-14 h-7 rounded-full transition-all duration-300 relative ${prefs.useGPS ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${prefs.useGPS ? 'left-8' : 'left-1'}`} />
                    </button>
                </div>

                {/* --- LOCATION SEARCH SECTION --- */}
                <div className={`relative z-30 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] transition-all duration-500 shadow-2xl backdrop-blur-sm ${prefs.useGPS ? 'opacity-30 grayscale pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
                    
                    <h3 className="text-blue-400 font-bold mb-6 flex items-center gap-3 tracking-tight">
                        <MapPin size={20} /> Select Home City
                    </h3>

                    {/* Wrapper for the Autocomplete + Icon */}
                    <div className="geoapify-custom-wrapper relative group">
                        {/* Absolute Search Icon - Positioned specifically for the input field */}
                        <Search 
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-20 pointer-events-none" 
                            size={20} 
                        />
                        
                        <GeoapifyContext apiKey={import.meta.env.VITE_GEOAPIFY_API_KEY}>
                            <GeoapifyGeocoderAutocomplete
                                placeholder="Search city (e.g. Cainta, Rizal)"
                                type="city"
                                lang="en"
                                limit={5}
                                value={prefs.homeCity}
                                placeSelect={onPlaceSelect}
                            />
                        </GeoapifyContext>
                    </div>

                    {/* Current Selection Label */}
                    <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                        Saved: <span className="text-blue-400 font-bold">{prefs.homeCity || "Not set"}</span>
                    </p>
                </div>
                {/* --- NOTIFICATIONS SECTION --- */}
                <div className="relative z-10 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
                    <h3 className="text-blue-400 font-bold mb-8 flex items-center gap-3 text-white tracking-tight">
                        <Bell size={20} /> Notifications
                    </h3>
                    <div className="space-y-4">
                        {[
                            { id: 'morningAlert', label: 'Morning Briefing', desc: 'Personalized advice at 7:00 AM' },
                            { id: 'eveningAlert', label: 'Evening Forecast', desc: 'Nightly recap at 8:00 PM' },
                            { id: 'alertOnSuddenChange', label: 'Sudden Changes', desc: 'Immediate weather shifts', icon: <Zap size={14} className="text-amber-400 fill-amber-400/20" /> }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all duration-300">
                                <div>
                                    <p className="font-bold flex items-center gap-2 text-white text-sm tracking-wide">
                                        {item.label} {item.icon}
                                    </p>
                                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">{item.desc}</p>
                                </div>
                                <button 
                                    onClick={() => setPrefs({...prefs, [item.id as keyof typeof prefs]: !prefs[item.id as keyof typeof prefs]})}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${prefs[item.id as keyof typeof prefs] ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${prefs[item.id as keyof typeof prefs] ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* --- UNIT PREFERENCES SECTION --- */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
                        <h3 className="text-blue-400 font-bold mb-8 flex items-center gap-3 text-white tracking-tight">
                            <Thermometer size={20} /> Display Units
                        </h3>

                        <div className="space-y-6">
                            {/* Temperature Unit */}
                            <div className="flex items-center justify-between p-2 bg-white/[0.03] border border-white/5 rounded-2xl">
                                <span className="ml-3 text-sm font-medium text-slate-300">Temperature</span>
                                <div className="flex bg-[#05070A] p-1 rounded-xl border border-white/5">
                                    {[
                                        { label: '°C', value: 'celsius' },
                                        { label: '°F', value: 'fahrenheit' }
                                    ].map((unit) => (
                                        <button
                                            key={unit.value}
                                            onClick={() => setPrefs({ ...prefs, tempUnit: unit.value })}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                                                prefs.tempUnit === unit.value 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            {unit.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Wind Speed Unit */}
                            <div className="flex items-center justify-between p-2 bg-white/[0.03] border border-white/5 rounded-2xl">
                                <span className="ml-3 text-sm font-medium text-slate-300">Wind Speed</span>
                                <div className="flex bg-[#05070A] p-1 rounded-xl border border-white/5">
                                    {[
                                        { label: 'km/h', value: 'kmh' },
                                        { label: 'mph', value: 'mph' },
                                        { label: 'm/s', value: 'ms' }
                                    ].map((unit) => (
                                        <button
                                            key={unit.value}
                                            onClick={() => setPrefs({ ...prefs, windUnit: unit.value })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                                                prefs.windUnit === unit.value 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            {unit.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pressure Unit */}
                            <div className="flex items-center justify-between p-2 bg-white/[0.03] border border-white/5 rounded-2xl">
                                <span className="ml-3 text-sm font-medium text-slate-300">Pressure</span>
                                <div className="flex bg-[#05070A] p-1 rounded-xl border border-white/5">
                                    {[
                                        { label: 'hPa', value: 'hpa' },
                                        { label: 'inHg', value: 'inhg' }
                                    ].map((unit) => (
                                        <button
                                            key={unit.value}
                                            onClick={() => setPrefs({ ...prefs, pressureUnit: unit.value })}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                                                prefs.pressureUnit === unit.value 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            {unit.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                {/* --- SAVE BUTTON --- */}
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-5 rounded-3xl font-black text-white uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                >
                    {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /> Save Changes</>}
                </button>

                {saveSuccess && (
                    <p className="text-center text-emerald-400 flex items-center justify-center gap-2 text-sm font-bold tracking-wide animate-in fade-in slide-in-from-top-2">
                        <CheckCircle size={18} /> {saveSuccess}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Settings;