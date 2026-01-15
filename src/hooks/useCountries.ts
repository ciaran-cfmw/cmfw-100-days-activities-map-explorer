import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CountryData } from '../types';

interface UseCountriesResult {
    countries: CountryData[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useCountries(): UseCountriesResult {
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const { data, error: supabaseError } = await supabase
                .from('countries')
                .select('*');

            if (supabaseError) {
                throw supabaseError;
            }

            // Transform Supabase data to match CountryData interface
            const transformedData: CountryData[] = (data || []).map((item) => ({
                id: item.id,
                name: item.name,
                status: item.status,
                active_schools: item.active_schools,
                total_pledges: item.total_pledges,
                highlights: item.highlights || [],
                body: item.body,
            }));

            setCountries(transformedData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch countries'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    return { countries, loading, error, refetch: fetchCountries };
}
