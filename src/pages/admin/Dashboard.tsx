import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useActivities } from '../../hooks/useActivities';
import { Loader } from '../../components/Loader';
import { TallyEmbed } from '../../components/TallyEmbed';
import { ThemeToggle } from '../../components/ThemeToggle';
import { EditActivityModal } from '../../components/EditActivityModal';
import { Activity } from '../../types';
import { CustomSelect } from '../../components/CustomSelect';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export const Dashboard: React.FC = () => {
    const { activities, loading, error, refetch } = useActivities();
    const [isSignoutLoading, setIsSignoutLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [showTallyForm, setShowTallyForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

    // Advanced filters
    const [searchQuery, setSearchQuery] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
        }
        return 'dark';
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleSignOut = async () => {
        setIsSignoutLoading(true);
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const handleApprove = async (slug: string) => {
        try {
            const { error: updateError } = await supabase
                .from('activities')
                .update({ status: 'approved' })
                .eq('slug', slug);

            if (updateError) throw updateError;
            refetch();
        } catch (err: any) {
            alert(`Error approving activity: ${err.message}`);
        }
    };

    const handleReject = async (slug: string) => {
        const confirmed = window.confirm('Reject this submission? It will be hidden from the public map.');
        if (!confirmed) return;

        try {
            const { error: updateError } = await supabase
                .from('activities')
                .update({ status: 'rejected' })
                .eq('slug', slug);

            if (updateError) throw updateError;
            refetch();
        } catch (err: any) {
            alert(`Error rejecting activity: ${err.message}`);
        }
    };

    const handleDelete = async (slug: string) => {
        const confirmed = window.confirm(`Are you sure you want to permanently delete this activity?`);
        if (!confirmed) return;

        try {
            const { error: deleteError } = await supabase
                .from('activities')
                .delete()
                .eq('slug', slug);

            if (deleteError) throw deleteError;
            refetch();
        } catch (err: any) {
            alert(`Error deleting activity: ${err.message}`);
        }
    };

    // Helper to extract country from title (e.g., "Kazindiro, Uganda" -> "Uganda")
    const getCountry = (activity: Activity): string => {
        if (activity.country) return activity.country;
        // Fallback: extract from title (format: "Location, Country")
        const parts = activity.title?.split(',');
        if (parts && parts.length >= 2) {
            return parts[parts.length - 1].trim();
        }
        return '';
    };

    // Extract unique countries and types for filter dropdowns
    const uniqueCountries = [...new Set(activities.map(a => getCountry(a)).filter(Boolean))] as string[];
    const uniqueTypes = [...new Set(activities.map(a => a.type).filter(Boolean))] as string[];

    // Filter activities by all criteria
    const filteredActivities = activities.filter(a => {
        // Status filter
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;

        // Search filter (title, organizer, organization)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesTitle = a.title?.toLowerCase().includes(query);
            const matchesOrganizer = a.submitter_name?.toLowerCase().includes(query);
            const matchesOrg = a.organization?.toLowerCase().includes(query);
            if (!matchesTitle && !matchesOrganizer && !matchesOrg) return false;
        }

        // Country filter (use helper to extract from title if needed)
        if (countryFilter !== 'all' && getCountry(a) !== countryFilter) return false;

        // Type filter
        if (typeFilter !== 'all' && a.type !== typeFilter) return false;

        return true;
    });

    // Count by status
    const statusCounts = {
        all: activities.length,
        pending: activities.filter(a => (a as any).status === 'pending').length,
        approved: activities.filter(a => (a as any).status === 'approved').length,
        rejected: activities.filter(a => (a as any).status === 'rejected').length,
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-ocean"><Loader /></div>;

    return (
        <div className="min-h-screen bg-ocean text-brandCream">
            {/* Tally Form Modal */}
            {showTallyForm && <TallyEmbed autoDetectLocation={false} onClose={() => setShowTallyForm(false)} />}

            {/* Edit Activity Modal */}
            {editingActivity && (
                <EditActivityModal
                    activity={editingActivity}
                    onClose={() => setEditingActivity(null)}
                    onSave={() => refetch()}
                />
            )}

            {/* Header */}
            <nav className="border-b border-white/10 bg-brandDeep/50 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src="https://static.wixstatic.com/media/4b4c63_54d21e482fea49acaba50908b008a873~mv2.png/v1/fill/w_562,h_170,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/cmfw-logo-two-color_edited.png"
                                alt="Logo"
                                className="h-8 w-auto"
                            />
                            <span className="text-xl font-heading hidden md:block">Campaign Manager</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                            <button
                                onClick={() => window.location.href = '/'}
                                className="text-sm text-brandGrey hover:text-brandCream transition-colors flex items-center gap-1"
                            >
                                <i className='bx bx-map-alt'></i>
                                View Map
                            </button>
                            <button
                                onClick={handleSignOut}
                                disabled={isSignoutLoading}
                                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <i className='bx bx-log-out'></i>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-heading">Activities Dashboard</h1>
                        <p className="text-brandGrey">Manage all campaign markers and impact data</p>
                    </div>
                    <button
                        onClick={() => setShowTallyForm(true)}
                        className="rounded-lg bg-brandRed px-6 py-3 font-bold hover:bg-brandRed/90 transition-all shadow-lg active:scale-95 text-center flex items-center justify-center gap-2"
                    >
                        <i className='bx bx-calendar-plus text-xl'></i>
                        Register New Event
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? status === 'pending'
                                    ? 'bg-yellow-600 text-white'
                                    : status === 'approved'
                                        ? 'bg-green-600 text-white'
                                        : status === 'rejected'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-brandRed text-white'
                                : 'bg-white/10 text-brandGrey hover:bg-white/20'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                        </button>
                    ))}

                    {/* Toggle Filters Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${showFilters ? 'bg-brandRed text-white' : 'bg-white/10 text-brandGrey hover:bg-white/20'}`}
                    >
                        <i className='bx bx-filter-alt'></i>
                        Filters
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brandGrey mb-1">Search</label>
                            <div className="relative">
                                <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-brandGrey'></i>
                                <input
                                    type="text"
                                    placeholder="Title, organizer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/40 dark:bg-white/5 border border-brandRed/20 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-brandCream placeholder:text-brandGrey/50 focus:border-brandRed focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Country */}
                        <CustomSelect
                            label="Country"
                            value={countryFilter}
                            onChange={setCountryFilter}
                            options={[
                                { value: 'all', label: 'All Countries' },
                                ...uniqueCountries.sort().map(c => ({ value: c, label: c }))
                            ]}
                        />

                        {/* Type */}
                        <CustomSelect
                            label="Event Type"
                            value={typeFilter}
                            onChange={setTypeFilter}
                            options={[
                                { value: 'all', label: 'All Types' },
                                ...uniqueTypes.sort().map(t => ({ value: t, label: t }))
                            ]}
                        />

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setCountryFilter('all');
                                    setTypeFilter('all');
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-white/20 text-brandGrey hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                <i className='bx bx-x'></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl mb-6 text-red-200">
                        Error loading activities: {error.message}
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-brandRed/20 dark:border-white/10 bg-brandDeep/40 dark:bg-brandDeep/30 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-brandDeep/50 text-brandGrey uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4 w-[40%]">Title</th>
                                <th className="px-6 py-4 w-[20%]">Type</th>
                                <th className="px-6 py-4 w-[15%]">Start Date</th>
                                <th className="px-6 py-4 w-[10%]">Status</th>
                                <th className="px-6 py-4 w-[15%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brandRed/20 dark:divide-brandRed/10">
                            {filteredActivities.map((activity) => {
                                const status = activity.status || 'approved';
                                // Format date for display
                                const formatDate = (dateStr?: string) => {
                                    if (!dateStr) return '—';
                                    try {
                                        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                    } catch { return '—'; }
                                };
                                return (
                                    <tr key={activity.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{activity.title}</div>
                                            {activity.submitter_name && (
                                                <div className="text-xs text-brandGrey">by {activity.submitter_name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 text-xs border border-blue-300 dark:border-blue-200">
                                                {activity.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-brandGold font-mono text-sm">{formatDate(activity.event_date)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-600 border border-yellow-300' :
                                                status === 'approved' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-600 border border-green-300' :
                                                    'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-600 border border-red-300'
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(activity.id)}
                                                        className="px-3 py-1 text-xs bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-all flex h-8 items-center gap-1"
                                                    >
                                                        <i className='bx bx-check'></i>
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(activity.id)}
                                                        className="px-3 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all flex h-8 items-center gap-1"
                                                    >
                                                        <i className='bx bx-x'></i>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setEditingActivity(activity)}
                                                className="p-2 text-blue-400/60 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all"
                                                title="Edit Activity"
                                            >
                                                <i className='bx bx-edit text-lg'></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(activity.id)}
                                                className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Delete Activity"
                                            >
                                                <i className='bx bx-trash text-lg'></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredActivities.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-brandGrey">
                                        No activities found with status "{statusFilter}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden space-y-4">
                    {filteredActivities.map((activity) => {
                        const status = activity.status || 'approved';
                        const formatDate = (dateStr?: string) => {
                            if (!dateStr) return '—';
                            try {
                                return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                            } catch { return '—'; }
                        };
                        return (
                            <div key={activity.id} className="bg-brandDeep/40 dark:bg-brandDeep/30 border border-brandRed/20 dark:border-white/10 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{activity.title}</h3>
                                        <p className="text-xs text-brandGrey">
                                            {activity.submitter_name ? `by ${activity.submitter_name}` : activity.type} • {formatDate(activity.event_date)}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${status === 'pending' ? 'bg-yellow-900/40 text-yellow-200' :
                                        status === 'approved' ? 'bg-green-900/40 text-green-200' :
                                            'bg-red-900/40 text-red-200'
                                        }`}>
                                        {status}
                                    </span>
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                    {status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(activity.id)}
                                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(activity.id)}
                                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="px-4 py-2 text-sm text-red-400 font-bold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main >
        </div >
    );
};
