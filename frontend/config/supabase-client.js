// Supabase client for Jeevandhara
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabaseConfig } from '../config/supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

function normalizeUserRecord(record) {
    if (!record) return null;

    const derivedName = [record.first_name, record.middle_name, record.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();

    return {
        ...record,
        name: record.name || derivedName || 'Unknown User',
        phone: record.phone || record.phone_number || ''
    };
}

function uniqueById(rows) {
    const result = [];
    const seen = new Set();

    for (const row of rows || []) {
        const key = row && row.id ? String(row.id) : JSON.stringify(row);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(row);
    }

    return result;
}

function getLookupKeys(userRecordOrId) {
    if (!userRecordOrId) return [];
    if (typeof userRecordOrId === 'string') return [userRecordOrId];

    return [userRecordOrId.id, userRecordOrId.firebase_uid]
        .filter(Boolean)
        .map((value) => String(value));
}

function getActivityLookupKeys(userId, userRecord = null) {
    const keys = [
        typeof userId === 'string' ? userId : null,
        userRecord && userRecord.firebase_uid ? String(userRecord.firebase_uid) : null,
        userRecord && userRecord.id ? String(userRecord.id) : null
    ]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean);

    return [...new Set(keys)];
}

function getPrimaryActivityUserKey(userRecord) {
    if (!userRecord) return '';
    return String(userRecord.firebase_uid || userRecord.id || '').trim();
}

async function resolveActivityKeys(userId) {
    const user = await getUserByIdentifier(userId);
    return getActivityLookupKeys(userId, user);
}

function createCountMap(rows) {
    const map = new Map();
    for (const row of rows || []) {
        const key = row && row.user_id ? String(row.user_id) : '';
        if (!key) continue;
        map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
}

function getMappedCount(map, user) {
    const keys = getLookupKeys(user);
    if (keys.length === 0) return 0;

    return keys.reduce((highest, key) => {
        return Math.max(highest, map.get(key) || 0);
    }, 0);
}

async function getUserByIdentifier(userIdentifier) {
    const keys = getLookupKeys(userIdentifier);
    if (keys.length === 0) return null;

    for (const key of keys) {
        const byId = await supabase
            .from('users')
            .select('*')
            .eq('id', key)
            .maybeSingle();

        if (!byId.error && byId.data) {
            return normalizeUserRecord(byId.data);
        }

        const byFirebaseUid = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', key)
            .maybeSingle();

        if (!byFirebaseUid.error && byFirebaseUid.data) {
            return normalizeUserRecord(byFirebaseUid.data);
        }
    }

    return null;
}

async function getRowsByUserKeys(tableName, keys, options = {}) {
    const { orderBy = 'created_at', ascending = false, select = '*' } = options;
    const allRows = [];

    for (const key of keys) {
        const { data, error } = await supabase
            .from(tableName)
            .select(select)
            .eq('user_id', key)
            .order(orderBy, { ascending });

        if (error) {
            console.error(`Error fetching ${tableName} for key ${key}:`, error);
            continue;
        }

        if (data && data.length > 0) {
            allRows.push(...data);
        }
    }

    return uniqueById(allRows);
}

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
        const keys = await resolveActivityKeys(userId);
        const rows = await getRowsByUserKeys('donation_history', keys, {
            orderBy: 'donation_date',
            ascending: false,
            select: '*'
        });

        return (rows || []).sort((a, b) => {
            const timeA = a && a.donation_date ? new Date(a.donation_date).getTime() : 0;
            const timeB = b && b.donation_date ? new Date(b.donation_date).getTime() : 0;
            return timeB - timeA;
        });
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
        const keys = await resolveActivityKeys(userId);
        return await getRowsByUserKeys('user_badges', keys, {
            orderBy: 'earned_at',
            ascending: false,
            select: `
                *,
                badges (
                    id,
                    name,
                    description,
                    icon,
                    criteria
                )
            `
        });
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
        const keys = await resolveActivityKeys(userId);
        const rows = await getRowsByUserKeys('rewards', keys, {
            orderBy: 'created_at',
            ascending: false,
            select: '*'
        });

        return (rows || []).sort((a, b) => {
            const timeA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error('Error in getUserRewards:', error);
        return [];
    }
}

// Admin Functions
export async function getAllUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all users:', error);
            return [];
        }

        return (data || []).map(normalizeUserRecord);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return [];
    }
}

export async function getAllBadges() {
    try {
        const { data, error } = await supabase
            .from('badges')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching badges catalog:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAllBadges:', error);
        return [];
    }
}

export async function getAdminDashboardData() {
    try {
        const [
            usersResult,
            donationsResult,
            userBadgesResult,
            rewardsResult
        ] = await Promise.all([
            supabase.from('users').select('*').order('created_at', { ascending: false }),
            supabase.from('donation_history').select('id,user_id,donation_date,donation_status'),
            supabase.from('user_badges').select('id,user_id,badge_id,earned_at,earned_date'),
            supabase.from('rewards').select('id,user_id,is_claimed')
        ]);

        if (usersResult.error) {
            console.error('Error fetching users for admin dashboard:', usersResult.error);
            return {
                users: [],
                totals: {
                    users: 0,
                    donations: 0,
                    badges: 0,
                    rewards: 0
                }
            };
        }

        if (donationsResult.error) {
            console.error('Error fetching donation summary for admin dashboard:', donationsResult.error);
        }
        if (userBadgesResult.error) {
            console.error('Error fetching badge summary for admin dashboard:', userBadgesResult.error);
        }
        if (rewardsResult.error) {
            console.error('Error fetching reward summary for admin dashboard:', rewardsResult.error);
        }

        const users = (usersResult.data || []).map(normalizeUserRecord);
        const donations = donationsResult.data || [];
        const userBadges = userBadgesResult.data || [];
        const rewards = rewardsResult.data || [];

        const donationCountMap = createCountMap(donations);
        const badgeCountMap = createCountMap(userBadges);
        const rewardCountMap = createCountMap(rewards);

        const usersWithStats = users.map((user) => ({
            ...user,
            totalDonations: getMappedCount(donationCountMap, user),
            totalBadges: getMappedCount(badgeCountMap, user),
            totalRewards: getMappedCount(rewardCountMap, user)
        }));

        return {
            users: usersWithStats,
            totals: {
                users: users.length,
                donations: donations.length,
                badges: userBadges.length,
                rewards: rewards.length
            }
        };
    } catch (error) {
        console.error('Error in getAdminDashboardData:', error);
        return {
            users: [],
            totals: {
                users: 0,
                donations: 0,
                badges: 0,
                rewards: 0
            }
        };
    }
}

export async function getAdminUserDetails(userIdentifier) {
    try {
        const user = await getUserByIdentifier(userIdentifier);
        if (!user) {
            return null;
        }

        const keys = getLookupKeys(user);
        const [donations, badges, rewards] = await Promise.all([
            getRowsByUserKeys('donation_history', keys, {
                orderBy: 'donation_date',
                ascending: false,
                select: '*'
            }),
            getRowsByUserKeys('user_badges', keys, {
                orderBy: 'earned_at',
                ascending: false,
                select: `
                    *,
                    badges (
                        *
                    )
                `
            }),
            getRowsByUserKeys('rewards', keys, {
                orderBy: 'created_at',
                ascending: false,
                select: '*'
            })
        ]);

        return {
            user,
            donations,
            badges,
            rewards
        };
    } catch (error) {
        console.error('Error in getAdminUserDetails:', error);
        return null;
    }
}

export async function assignBadgeToUser(userIdentifier, badgeId) {
    try {
        if (!badgeId) {
            return { success: false, error: 'Badge ID is required.' };
        }

        const user = await getUserByIdentifier(userIdentifier);
        if (!user) {
            return { success: false, error: 'User not found.' };
        }

        const userKey = getPrimaryActivityUserKey(user);
        if (!userKey) {
            return { success: false, error: 'Unable to resolve user key.' };
        }

        const allUserKeys = getActivityLookupKeys(userIdentifier, user);

        const existing = await supabase
            .from('user_badges')
            .select('id,user_id')
            .eq('badge_id', badgeId)
            .in('user_id', allUserKeys)
            .limit(1);

        if (existing.error) {
            console.error('Error checking existing badge assignment:', existing.error);
            return { success: false, error: existing.error.message || 'Failed to verify existing badge assignment.' };
        }

        if (existing.data && existing.data.length > 0) {
            return { success: true, alreadyAssigned: true, data: existing.data[0] };
        }

        const payload = {
            user_id: userKey,
            badge_id: badgeId,
            earned_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('user_badges')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error assigning badge to user:', error);
            return { success: false, error: error.message || 'Failed to assign badge.' };
        }

        return { success: true, alreadyAssigned: false, data };
    } catch (error) {
        console.error('Error in assignBadgeToUser:', error);
        return { success: false, error: 'Failed to assign badge.' };
    }
}

export async function updateUserProfileByIdentifier(userIdentifier, updates) {
    try {
        const user = await getUserByIdentifier(userIdentifier);
        if (!user) {
            return null;
        }

        const payload = {
            updated_at: new Date().toISOString()
        };

        const allowedFields = ['name', 'email', 'phone', 'phone_number', 'gender', 'blood_group'];
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                payload[field] = updates[field];
            }
        }

        if (Object.keys(payload).length === 1) {
            return user;
        }

        const userKey = user.id || user.firebase_uid;
        const { data, error } = await supabase
            .from('users')
            .update(payload)
            .eq('id', userKey)
            .select('*')
            .maybeSingle();

        if (error) {
            console.error('Error updating user profile by id:', error);

            const fallback = await supabase
                .from('users')
                .update(payload)
                .eq('firebase_uid', userKey)
                .select('*')
                .maybeSingle();

            if (fallback.error) {
                console.error('Error updating user profile by firebase_uid:', fallback.error);
                return null;
            }

            return normalizeUserRecord(fallback.data);
        }

        return normalizeUserRecord(data);
    } catch (error) {
        console.error('Error in updateUserProfileByIdentifier:', error);
        return null;
    }
}

export async function createRewardForUser(userIdentifier, rewardData) {
    try {
        const user = await getUserByIdentifier(userIdentifier);
        if (!user) {
            return null;
        }

        const userKey = getPrimaryActivityUserKey(user);
        const payload = {
            user_id: userKey,
            reward_type: rewardData.reward_type || 'Reward',
            reward_value: rewardData.reward_value || 'Pending',
            reward_description: rewardData.reward_description || null,
            expiry_date: rewardData.expiry_date || null,
            is_claimed: false,
            earned_date: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('rewards')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error creating reward for user:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in createRewardForUser:', error);
        return null;
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