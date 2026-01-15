// Supabase Edge Function to receive Tally.so webhook submissions
// Deploy with: supabase functions deploy tally-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TallyField {
    key: string
    label: string
    type: string
    value: any
}

interface TallyPayload {
    eventId: string
    eventType: string
    createdAt: string
    data: {
        responseId: string
        submissionId: string
        respondentId: string
        formId: string
        formName: string
        createdAt: string
        fields: TallyField[]
    }
}

// Fuzz coordinates to ~1km accuracy for privacy
const fuzzCoord = (coord: number) => Math.round(coord * 100) / 100;

// Map Tally event types to our activity types
function mapEventType(tallyType: string): string {
    const typeMap: Record<string, string> = {
        'School Event': 'School Pledge',
        'Community Event': 'Community Awareness',
        'Faith-based Event': 'Faith Leader Action',
        'Engaging Decision Maker': 'Gov Engagement',
        'Awareness Raising Engagement': 'Awareness Raising',
    }
    return typeMap[tallyType] || tallyType || 'Community Awareness'
}

// Geocode address using Nominatim (OpenStreetMap)
async function geocodeAddress(town: string, country: string): Promise<[number, number] | null> {
    const query = encodeURIComponent(`${town}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'CMFW-100-Days-Explorer/1.0 (contact@cmfw.world)',
            },
        });

        if (!response.ok) {
            console.error('Nominatim API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const lat = fuzzCoord(parseFloat(data[0].lat));
            const lon = fuzzCoord(parseFloat(data[0].lon));
            console.log(`Geocoded "${town}, ${country}" to [${lon}, ${lat}]`);
            return [lon, lat]; // [longitude, latitude] for GeoJSON
        }

        console.log(`No geocoding results for "${town}, ${country}"`);
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload: TallyPayload = await req.json()

        // Only process form submissions
        if (payload.eventType !== 'FORM_RESPONSE') {
            return new Response(JSON.stringify({ message: 'Not a form response' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const fields = payload.data.fields

        // Extract field values by label
        const getFieldValue = (label: string): any => {
            const field = fields.find(f => f.label.toLowerCase().includes(label.toLowerCase()))
            return field?.value || null
        }

        // Check permission consent
        const permission = getFieldValue('permission')
        if (!permission || (Array.isArray(permission) && !permission.some(p => p.toLowerCase().includes('yes')))) {
            console.log('Submission rejected: no permission granted')
            return new Response(JSON.stringify({ message: 'No permission granted' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // Extract form data (labels aligned with current Tally form)
        const fullName = getFieldValue('full name') || 'Anonymous'
        const eventType = getFieldValue('type of event') || getFieldValue('what type') || 'Community Event'
        const organization = getFieldValue('organisation') || getFieldValue('community') || ''
        const town = getFieldValue('town') || getFieldValue('district') || 'Unknown Location'
        const country = getFieldValue('country') || 'Unknown'
        const day = parseInt(getFieldValue('day')) || parseInt(getFieldValue('which day')) || 1
        const email = getFieldValue('email') || ''

        // Date fields - aligned with Tally form
        const eventDate = getFieldValue('which day will you be holding') || getFieldValue('event date') || getFieldValue('date')
        const eventEndDate = getFieldValue('event runs over several days') || getFieldValue('conclude') || getFieldValue('end date')

        // Get coordinates from hidden fields (from browser geolocation)
        let lat = parseFloat(getFieldValue('lat'))
        let lng = parseFloat(getFieldValue('lng'))

        // Determine coordinates source and get final values
        let coordinates: [number, number] = [0, 0];
        let coordinateSource = 'manual';

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            // Use browser geolocation (already fuzzed by client)
            coordinates = [lng, lat]; // [longitude, latitude] for GeoJSON
            coordinateSource = 'browser';
            console.log(`Using browser coords: [${lng}, ${lat}]`);
        } else {
            // Fallback to Nominatim geocoding
            const geocoded = await geocodeAddress(town, country);
            if (geocoded) {
                coordinates = geocoded;
                coordinateSource = 'nominatim';
            } else {
                // No coordinates available - admin will set manually
                coordinateSource = 'pending';
                console.log('No coordinates available, setting to pending');
            }
        }

        // Generate slug from town and country
        const slug = `tally-${town.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`

        // Create Supabase client with service role key for inserts
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Determine status - if we have valid coordinates, approve immediately
        const status = coordinateSource === 'pending' ? 'pending' : 'pending'; // Still require admin review

        // Insert new activity
        const { data, error } = await supabase
            .from('activities')
            .insert({
                slug,
                title: `${town}, ${country}`,
                type: mapEventType(eventType),
                coordinates,
                description: `Submitted by ${fullName} via event registration form.`,
                body: `**Submitted Registration**\n\nOrganization: ${organization || 'N/A'}\nContact: ${email}\nCoordinate Source: ${coordinateSource}`,
                day: Math.min(Math.max(day, 1), 100),
                event_date: eventDate || null,
                event_end_date: eventEndDate || null, // Multi-day event support
                submitter_name: fullName,
                submitter_email: email,
                organization: organization,
                country: country,
                status,
                show_organizer: false, // Default to hidden, admin can enable
            })
            .select()

        if (error) {
            console.error('Supabase insert error:', error)
            throw error
        }

        console.log('Activity created:', data)

        return new Response(JSON.stringify({
            success: true,
            id: data?.[0]?.id,
            coordinateSource,
            coordinates
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
