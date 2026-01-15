const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function provisionAdmin() {
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: 'admin@cmfw.world',
            password: 'password123',
            email_confirm: true,
        });

        if (error) {
            if (error.message.includes('already been registered')) {
                console.log('Admin user already exists, updating password...');
                const { data: users } = await supabase.auth.admin.listUsers();
                const admin = users?.users?.find(u => u.email === 'admin@cmfw.world');
                if (admin) {
                    await supabase.auth.admin.updateUserById(admin.id, { password: 'password123' });
                    console.log('Password updated for admin@cmfw.world');
                }
            } else {
                throw error;
            }
        } else {
            console.log('Admin user created:', data.user?.email);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

provisionAdmin();
