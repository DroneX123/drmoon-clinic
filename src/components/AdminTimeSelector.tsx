import React from 'react';
import { Clock } from 'lucide-react';

interface AdminTimeSelectorProps {
    value: string;
    onChange: (time: string) => void;
}

const AdminTimeSelector: React.FC<AdminTimeSelectorProps> = ({ value, onChange }) => {
    // Generate time slots from 09:00 to 19:00 every 30 mins
    const timeSlots = [];
    for (let i = 9; i <= 19; i++) {
        timeSlots.push(`${String(i).padStart(2, '0')}:00`);
        if (i !== 19) timeSlots.push(`${String(i).padStart(2, '0')}:30`);
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-lg font-bold text-slate-900">Heure</span>
                <Clock className="w-4 h-4 text-gold" />
            </div>

            <div className="grid grid-cols-3 gap-2 overflow-y-auto custom-scrollbar pr-1 max-h-[300px]">
                {timeSlots.map((slot) => (
                    <button
                        key={slot}
                        onClick={() => onChange(slot)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200
                            ${value === slot
                                ? 'bg-slate-900 text-gold shadow-md shadow-slate-900/20 font-bold'
                                : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
                            }
                        `}
                    >
                        {slot}
                    </button>
                ))}
            </div>

            {/* Custom Input Fallback */}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Ou saisir manuellement</p>
                <input
                    type="time"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gold/20"
                />
            </div>
        </div>
    );
};

export default AdminTimeSelector;
