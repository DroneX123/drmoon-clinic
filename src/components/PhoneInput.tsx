import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type CountryCode = 'DZ' | 'FR' | 'BE' | 'GB' | 'ES' | 'IT' | 'DE' | 'CH';

interface CountryData {
    code: CountryCode;
    dialCode: string;
    flag: string;
    name: string;
    format: (clean: string) => string;
    maxLength: number; // Max significant digits (excluding leading 0)
    placeholder: string;
}

const COUNTRIES: CountryData[] = [
    {
        code: 'DZ',
        name: 'Algérie',
        flag: '🇩🇿',
        dialCode: '+213',
        maxLength: 9,
        placeholder: '550 12 34 56',
        format: (clean) => {
            // Algeria: 3 2 2 2 (e.g. 550 12 34 56)
            if (clean.length > 9) clean = clean.slice(0, 9);
            if (clean.length === 0) return '';

            // If user types 05..., strip the 0
            if (clean.startsWith('0') && clean.length > 1) {
                clean = clean.substring(1);
            }

            let formatted = '';
            // 5XX
            if (clean.length > 0) formatted += clean.substring(0, 3);
            // XX
            if (clean.length > 3) formatted += ' ' + clean.substring(3, 5);
            // XX
            if (clean.length > 5) formatted += ' ' + clean.substring(5, 7);
            // XX
            if (clean.length > 7) formatted += ' ' + clean.substring(7, 9);

            return formatted;
        }
    },
    {
        code: 'FR',
        name: 'France',
        flag: '🇫🇷',
        dialCode: '+33',
        maxLength: 9,
        placeholder: '6 12 34 56 78',
        format: (clean) => {
            if (clean.length > 9) clean = clean.slice(0, 9);
            let formatted = '';
            if (clean.length > 0) formatted += clean.substring(0, 1);
            if (clean.length > 1) formatted += ' ' + clean.substring(1, 3);
            if (clean.length > 3) formatted += ' ' + clean.substring(3, 5);
            if (clean.length > 5) formatted += ' ' + clean.substring(5, 7);
            if (clean.length > 7) formatted += ' ' + clean.substring(7, 9);
            return formatted;
        }
    },
    {
        code: 'BE',
        name: 'Belgique',
        flag: '🇧🇪',
        dialCode: '+32',
        maxLength: 9,
        placeholder: '470 12 34 56',
        format: (clean) => {
            if (clean.length > 9) clean = clean.slice(0, 9);
            let formatted = '';
            if (clean.length > 0) formatted += clean.substring(0, 3);
            if (clean.length > 3) formatted += ' ' + clean.substring(3, 5);
            if (clean.length > 5) formatted += ' ' + clean.substring(5, 7);
            if (clean.length > 7) formatted += ' ' + clean.substring(7, 9);
            return formatted;
        }
    },
    {
        code: 'GB',
        name: 'Royaume-Uni',
        flag: '🇬🇧',
        dialCode: '+44',
        maxLength: 10,
        placeholder: '7911 123456',
        format: (clean) => {
            if (clean.length > 10) clean = clean.slice(0, 10);
            let formatted = '';
            if (clean.length > 0) formatted += clean.substring(0, 4);
            if (clean.length > 4) formatted += ' ' + clean.substring(4, 10);
            return formatted;
        }
    },
    {
        code: 'DE',
        name: 'Allemagne',
        flag: '🇩🇪',
        dialCode: '+49',
        maxLength: 11, // Var length, max 11 usually
        placeholder: '151 12345678',
        format: (clean) => {
            if (clean.length > 11) clean = clean.slice(0, 11);
            return clean.replace(/(\d{3})(\d{1,})/, '$1 $2');
        }
    },
    {
        code: 'ES',
        name: 'Espagne',
        flag: '🇪🇸',
        dialCode: '+34',
        maxLength: 9,
        placeholder: '612 34 56 78',
        format: (clean) => {
            if (clean.length > 9) clean = clean.slice(0, 9);
            let formatted = '';
            if (clean.length > 0) formatted += clean.substring(0, 3);
            if (clean.length > 3) formatted += ' ' + clean.substring(3, 5);
            if (clean.length > 5) formatted += ' ' + clean.substring(5, 7);
            if (clean.length > 7) formatted += ' ' + clean.substring(7, 9);
            return formatted;
        }
    },
    {
        code: 'IT',
        name: 'Italie',
        flag: '🇮🇹',
        dialCode: '+39',
        maxLength: 10,
        placeholder: '312 345 6789',
        format: (clean) => {
            if (clean.length > 10) clean = clean.slice(0, 10);
            let formatted = '';
            if (clean.length > 0) formatted += clean.substring(0, 3);
            if (clean.length > 3) formatted += ' ' + clean.substring(3, 6);
            if (clean.length > 6) formatted += ' ' + clean.substring(6, 10);
            return formatted;
        }
    },
    {
        code: 'CH',
        name: 'Suisse',
        flag: '🇨🇭',
        dialCode: '+41',
        maxLength: 9,
        placeholder: '79 123 45 67',
        format: (clean) => {
            if (clean.length > 9) clean = clean.slice(0, 9);
            let formatted = '';
            if (clean.length > 0) formatted += clean.substring(0, 2);
            if (clean.length > 2) formatted += ' ' + clean.substring(2, 5);
            if (clean.length > 5) formatted += ' ' + clean.substring(5, 7);
            if (clean.length > 7) formatted += ' ' + clean.substring(7, 9);
            return formatted;
        }
    }
];

interface PhoneInputProps {
    value: string; // Full e.164: +213550123456
    onChange: (value: string, isValid: boolean) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
    const [localNumber, setLocalNumber] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initialize from incoming value
    useEffect(() => {
        // Try to match the existing value to a country
        const matchedCountry = COUNTRIES.find(c => value.startsWith(c.dialCode));
        if (matchedCountry) {
            setSelectedCountry(matchedCountry);
            // Extract the local part (remove dial code and any spaces)
            const rawLocal = value.slice(matchedCountry.dialCode.length).replace(/\s/g, '');
            // Format it
            setLocalNumber(matchedCountry.format(rawLocal));
        } else if (!value) {
            // Empty - keep default (DZ) but clear local
            setLocalNumber('');
        }
    }, []); // Only run on mount? No, value might come from outside, but we don't want to loop. 
    // Usually input is controlled. Let's trust internal state for typing, but sync if parent changes drastically.

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCountrySelect = (country: CountryData) => {
        setSelectedCountry(country);
        setIsOpen(false);
        // Clear number when country changes to avoid confusion, or keep?
        // Better to clear or reformat. Let's clear for safety/simplicity to ensure strict validation.
        setLocalNumber('');
        onChange(country.dialCode, false);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits

        // Handle copy-paste with leading 0 (e.g. 0550...) -> remove 0
        if (val.length > 0 && val.startsWith('0')) {
            val = val.substring(1);
        }

        const formatted = selectedCountry.format(val);
        setLocalNumber(formatted);

        // Calculate raw digits for validation
        const rawDigits = formatted.replace(/\s/g, '');
        const fullNumber = selectedCountry.dialCode + rawDigits;

        // Is Valid if it matches the expected max length
        // Note: some countries have variable length, but for this curated list mostly fixed.
        // We generally check if it reached the max length.
        const isValid = rawDigits.length === selectedCountry.maxLength;

        onChange(fullNumber, isValid);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-gold/50 focus-within:bg-white/10 transition-all">

                {/* Country Selector */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-3 border-r border-white/10 hover:bg-white/5 transition-colors bg-white/5"
                >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <ChevronDown className={`h-3 w-3 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dial Code Display */}
                <div className="flex items-center pl-4 pr-1 text-white/50 select-none">
                    {selectedCountry.dialCode}
                </div>

                {/* Phone Input */}
                <input
                    type="tel"
                    value={localNumber}
                    onChange={handleNumberChange}
                    placeholder={selectedCountry.placeholder}
                    className="flex-1 bg-transparent border-none py-3 px-2 text-white placeholder:text-white/20 focus:outline-none font-light tracking-wide w-full"
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl z-50 backdrop-blur-xl">
                    <div className="p-1 space-y-0.5">
                        {COUNTRIES.map(country => (
                            <button
                                key={country.code}
                                onClick={() => handleCountrySelect(country)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                                    ${selectedCountry.code === country.code ? 'bg-gold/20 text-white' : 'hover:bg-white/5 text-white/70'}
                                `}
                            >
                                <span className="text-xl">{country.flag}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{country.name}</div>
                                    <div className="text-xs text-white/40">{country.dialCode}</div>
                                </div>
                                {selectedCountry.code === country.code && (
                                    <Check className="h-3 w-3 text-gold" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhoneInput;
