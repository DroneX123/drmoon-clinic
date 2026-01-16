import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminCalendarProps {
    value: Date;
    onChange: (date: Date) => void;
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({ value, onChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(value));

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon = 0, Sun = 6

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === value.getDate() &&
            currentMonth.getMonth() === value.getMonth() &&
            currentMonth.getFullYear() === value.getFullYear();
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-lg font-bold text-slate-900 capitalize">
                    {monthNames[currentMonth.getMonth()]} <span className="text-slate-400 font-sans text-sm font-normal">{currentMonth.getFullYear()}</span>
                </span>
                <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                    <span key={day} className="text-[10px] font-bold text-slate-400 py-1 uppercase tracking-wider">{day}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty slots for previous month */}
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const selected = isSelected(day);
                    const today = isToday(day);

                    return (
                        <button
                            key={day}
                            onClick={() => {
                                const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                onChange(newDate);
                            }}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
                                ${selected
                                    ? 'bg-slate-900 text-gold shadow-md shadow-slate-900/20 scale-105 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }
                                ${today && !selected ? 'border border-gold/50 text-gold' : ''}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminCalendar;
