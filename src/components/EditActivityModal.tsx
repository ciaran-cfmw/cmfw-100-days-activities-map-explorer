import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { supabase } from '../lib/supabase';
import { CustomSelect } from './CustomSelect';

interface EditActivityModalProps {
    activity: Activity;
    onClose: () => void;
    onSave: () => void;
}

const EVENT_TYPES = [
    'School Pledge',
    'Community Awareness',
    'Faith Leader Action',
    'Gov Engagement',
    'Awareness Raising',
];

const COUNTRIES = [
    'Kenya', 'Uganda', 'Tanzania', 'Nigeria', 'Ghana', 'Sierra Leone', 'Liberia',
    'Malawi', 'Zimbabwe', 'Zambia', 'Cameroon', 'Togo', 'Niger', 'DRC', 'Burundi',
];

export const EditActivityModal: React.FC<EditActivityModalProps> = ({ activity, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: activity.title || '',
        type: activity.type || 'Community Awareness',
        organization: activity.organization || '',
        country: activity.country || '',
        day: activity.day || 1,
        event_date: activity.event_date || '',
        event_end_date: activity.event_end_date || '',
        submitter_name: activity.submitter_name || '',
        submitter_email: activity.submitter_email || '',
        show_organizer: activity.show_organizer || false,
        status: activity.status || 'pending',
        coordinates: activity.coordinates || [0, 0],
        description: activity.description || '',
        image: activity.image || '',
        body: activity.body || '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'lon' || name === 'lat') {
            const idx = name === 'lon' ? 0 : 1;
            const newCoords = [...formData.coordinates] as [number, number];
            newCoords[idx] = parseFloat(value) || 0;
            setFormData(prev => ({ ...prev, coordinates: newCoords }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('activities')
                .update({
                    title: formData.title,
                    type: formData.type,
                    organization: formData.organization,
                    country: formData.country,
                    day: formData.day,
                    event_date: formData.event_date || null,
                    event_end_date: formData.event_end_date || null,
                    submitter_name: formData.submitter_name,
                    submitter_email: formData.submitter_email,
                    show_organizer: formData.show_organizer,
                    status: formData.status,
                    coordinates: formData.coordinates,
                    description: formData.description,
                    image: formData.image || null,
                    body: formData.body || null,
                })
                .eq('slug', activity.id);

            if (updateError) throw updateError;

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brandDeep border border-brandRed/20 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-brandRed/20 dark:border-white/10">
                    <h2 className="text-2xl font-heading text-brandCream">Edit Activity</h2>
                    <button onClick={onClose} className="text-brandGrey hover:text-brandCream text-2xl">
                        <i className="bx bx-x"></i>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Title / Town */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Town / District</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                        />
                    </div>

                    {/* Country & Type Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <CustomSelect
                            label="Country"
                            value={formData.country}
                            onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
                            options={[
                                { value: '', label: 'Select Country' },
                                ...COUNTRIES.map(c => ({ value: c, label: c }))
                            ]}
                        />
                        <CustomSelect
                            label="Event Type"
                            value={formData.type}
                            onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                            options={EVENT_TYPES.map(t => ({ value: t, label: t }))}
                        />
                    </div>

                    {/* Organization */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Organization / Community</label>
                        <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                            className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                        />
                    </div>

                    {/* Dates Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Start Date</label>
                            <input
                                type="date"
                                name="event_date"
                                value={formData.event_date}
                                onChange={handleChange}
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">End Date</label>
                            <input
                                type="date"
                                name="event_end_date"
                                value={formData.event_end_date}
                                onChange={handleChange}
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Campaign Day</label>
                            <input
                                type="number"
                                name="day"
                                value={formData.day}
                                onChange={handleChange}
                                min={1}
                                max={100}
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Organizer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Organizer Name</label>
                            <input
                                type="text"
                                name="submitter_name"
                                value={formData.submitter_name}
                                onChange={handleChange}
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Email</label>
                            <input
                                type="email"
                                name="submitter_email"
                                value={formData.submitter_email}
                                onChange={handleChange}
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Show Organizer Toggle */}
                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            name="show_organizer"
                            checked={formData.show_organizer}
                            onChange={handleChange}
                            className="h-5 w-5 rounded border-white/20 bg-white/5 text-brandRed focus:ring-brandRed"
                        />
                        <label className="text-sm text-brandCream">Show organizer name on public map</label>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Longitude</label>
                            <input
                                type="number"
                                name="lon"
                                value={formData.coordinates[0]}
                                onChange={handleChange}
                                step="0.0001"
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Latitude</label>
                            <input
                                type="number"
                                name="lat"
                                value={formData.coordinates[1]}
                                onChange={handleChange}
                                step="0.0001"
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <CustomSelect
                        label="Status"
                        value={formData.status}
                        onChange={(val) => setFormData(prev => ({ ...prev, status: val as any }))}
                        options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'rejected', label: 'Rejected' }
                        ]}
                    />

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream focus:border-brandRed focus:outline-none resize-none"
                        />
                    </div>

                    {/* Rich Content Section */}
                    <div className="border-t border-brandRed/20 dark:border-white/10 pt-4 mt-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-brandGrey mb-3 flex items-center gap-2">
                            <i className='bx bx-image-alt'></i>
                            Rich Content
                        </h3>

                        {/* Image URL */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Image URL</label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream placeholder:text-brandGrey/50 focus:border-brandRed focus:outline-none"
                            />
                            {formData.image && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-brandRed/20 dark:border-white/10 bg-black/20 h-32 w-48 flex items-center justify-center">
                                    <img
                                        key={formData.image}
                                        src={formData.image}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                        onLoad={(e) => {
                                            e.currentTarget.style.display = 'block';
                                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'none';
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                    <div className="flex flex-col items-center justify-center text-brandGrey/50 text-xs" style={{ display: 'none' }}>
                                        <i className='bx bx-image-alt text-2xl mb-1'></i>
                                        <span>Failed to load</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Body (Markdown) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Body Content (Markdown)</label>
                            <textarea
                                name="body"
                                value={formData.body}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Add detailed information about this activity...

Supports **bold**, *italic*, and [links](url)."
                                className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg px-4 py-2 text-brandCream placeholder:text-brandGrey/50 focus:border-brandRed focus:outline-none resize-none font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-brandRed/20 dark:border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border border-white/20 text-brandGrey hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 rounded-lg bg-brandRed text-white font-bold hover:bg-brandRed/90 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving && <i className="bx bx-loader-alt animate-spin"></i>}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
