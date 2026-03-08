import React, {useEffect } from 'react';
import axios from 'axios';
import { Save, MapPin, Bell, Zap, CheckCircle } from 'lucide-react';

const Settings = () => {
    const [prefs, setPrefs] = React.useState({
        homeCity: "",
        useGPS: false,
        morningAlert: true,
        eveningAlert: true,
        alertOnSuddenChange: true,
    });
    const [saving, setSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState("");

    useEffect(() => {
        const fetchPreferences = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axios.get("http://localhost:5000/api/user/preferences", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPrefs(response.data);
        };
        fetchPreferences();
    }, []);

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
                console.error("Save error:", err); // Use the variable here
                setSaveSuccess('Failed to save settings.');
            } finally {
                setSaving(false);
            }
        };
    
return (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold mb-2">App Settings</h2>
            <p className="text-slate-400 mb-8">Personalize your WeatherMan experience.</p>

            <div className="space-y-6">
                {/* Location Section */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                    <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={18} /> Location
                    </h3>
                    <input 
                        type="text" 
                        value={prefs.homeCity}
                        onChange={(e) => setPrefs({...prefs, homeCity: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                        placeholder="Default City (e.g. Antipolo)"
                    />
                </div>

                {/* Notifications Section */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                    <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
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
                                    <p className="font-medium flex items-center gap-2">{item.label} {item.icon}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <button 
                                    onClick={() => setPrefs({...prefs, [item.id as keyof typeof prefs]: !prefs[item.id as keyof typeof prefs]})}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${prefs[item.id as keyof typeof prefs] ? 'bg-blue-600' : 'bg-slate-700'}`}
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
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                >
                    {saving ? 'Processing...' : <><Save size={20} /> Save Changes</>}
                </button>

                {saveSuccess && (
                    <p className="text-center text-emerald-400 flex items-center justify-center gap-2 text-sm font-medium">
                        <CheckCircle size={16} /> {saveSuccess}
                    </p>
                )}
            </div>
        </div>
    );
    };
    
    export default Settings;

