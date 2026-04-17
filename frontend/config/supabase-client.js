// Supabase client for Jeevandhara
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabaseConfig } from '../config/supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// User Profile Functions
export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return null;
    }
}

export async function createUserProfile(userData) {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{
                firebase_uid: userData.uid,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                gender: userData.gender,
                blood_group: userData.bloodGroup,
                created_at: userData.createdAt,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating user profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in createUserProfile:', error);
        return null;
    }
}

export async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('firebase_uid', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating user profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        return null;
    }
}

// Donation History Functions
export async function getUserDonationHistory(userId) {
    try {
        const { data, error } = await supabase
            .from('donation_history')
            .select('*')
            .eq('user_id', userId)
            .order('donation_date', { ascending: false });

        if (error) {
            console.error('Error fetching donation history:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserDonationHistory:', error);
        return [];
    }
}

export async function addDonationRecord(userId, donationData) {
    try {
        const { data, error } = await supabase
            .from('donation_history')
            .insert([{
                user_id: userId,
                donation_date: donationData.date,
                blood_bank: donationData.bloodBank,
                units_donated: donationData.units || 1,
                notes: donationData.notes || null
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding donation record:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in addDonationRecord:', error);
        return null;
    }
}

// Badge Functions
export async function getUserBadges(userId) {
    try {
        const { data, error } = await supabase
            .from('user_badges')
            .select(`
                *,
                badges (
                    id,
                    name,
                    description,
                    icon,
                    criteria
                )
            `)
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user badges:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserBadges:', error);
        return [];
    }
}

export async function checkAndAwardBadges(userId) {
    try {
        // Get user's donation count
        const donations = await getUserDonationHistory(userId);
        const donationCount = donations.length;

        // Get all available badges
        const { data: allBadges, error: badgesError } = await supabase
            .from('badges')
            .select('*');

        if (badgesError) {
            console.error('Error fetching badges:', badgesError);
            return;
        }

        // Get user's current badges
        const userBadges = await getUserBadges(userId);
        const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

        // Check each badge criteria
        for (const badge of allBadges) {
            if (!earnedBadgeIds.includes(badge.id)) {
                let shouldAward = false;

                switch (badge.criteria) {
                    case 'first_donation':
                        shouldAward = donationCount >= 1;
                        break;
                    case 'five_donations':
                        shouldAward = donationCount >= 5;
                        break;
                    case 'ten_donations':
                        shouldAward = donationCount >= 10;
                        break;
                    case 'regular_donor':
                        shouldAward = donationCount >= 3;
                        break;
                }

                if (shouldAward) {
                    await supabase
                        .from('user_badges')
                        .insert([{
                            user_id: userId,
                            badge_id: badge.id,
                            earned_at: new Date().toISOString()
                        }]);
                }
            }
        }
    } catch (error) {
        console.error('Error in checkAndAwardBadges:', error);
    }
}

// Rewards Functions
export async function getUserRewards(userId) {
    try {
        const { data, error } = await supabase
            .from('rewards')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user rewards:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserRewards:', error);
        return [];
    }
}

// Dashboard Stats
export async function getUserDashboardStats(userId) {
    try {
        const [profile, donations, badges, rewards] = await Promise.all([
            getUserProfile(userId),
            getUserDonationHistory(userId),
            getUserBadges(userId),
            getUserRewards(userId)
        ]);

        return {
            profile,
            totalDonations: donations.length,
            lastDonation: donations[0] || null,
            badges: badges.length,
            rewards: rewards.length,
            donations: donations.slice(0, 5) // Last 5 donations
        };
    } catch (error) {
        console.error('Error in getUserDashboardStats:', error);
        return null;
    }
}