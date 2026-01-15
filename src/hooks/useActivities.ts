import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Activity } from '../types';

interface UseActivitiesResult {
    activities: Activity[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useActivities(): UseActivitiesResult {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const { data, error: supabaseError } = await supabase
                .from('activities')
                .select('*')
                .order('day', { ascending: true });

            if (supabaseError) {
                throw supabaseError;
            }

            // Transform Supabase data to match Activity interface
            const transformedData: Activity[] = (data || []).map((item) => ({
                id: item.slug,
                title: item.title,
                type: item.type,
                coordinates: item.coordinates as [number, number],
                description: item.description,
                body: item.body,
                day: item.day,
                image: item.image,
                link_url: item.link_url,
                link_text: item.link_text,
                pledges_count: item.pledges_count,
                organization_name: item.organization_name,
                participant_feedback: item.participant_feedback,
            }));

            setActivities(transformedData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return { activities, loading, error, refetch: fetchActivities };
}
