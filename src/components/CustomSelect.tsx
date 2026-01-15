import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    options,
    onChange,
    label,
    placeholder = 'Select option',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/20 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-left text-brandCream flex items-center justify-between hover:bg-white/30 dark:hover:bg-white/10 transition-all focus:border-brandRed outline-none"
            >
                <span className={selectedOption ? 'text-brandCream' : 'text-brandGrey/50'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <i className={`bx bx-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isOpen && (
                <div className="absolute z-[60] mt-2 w-full bg-brandDeep border border-brandRed/20 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md animate-slide-down">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between ${value === option.value
                                    ? 'bg-brandRed text-white'
                                    : 'text-brandCream hover:bg-white/10'
                                    }`}
                            >
                                {option.label}
                                {value === option.value && <i className='bx bx-check'></i>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
