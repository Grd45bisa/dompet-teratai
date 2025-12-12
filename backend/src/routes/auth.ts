import { Router, Response, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest, UpdateProfileRequest, User } from '../types';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;

// The exact redirect URI - this MUST match Google Cloud Console
const GOOGLE_REDIRECT_URI = `${BACKEND_URL}/api/auth/google/callback`;

console.log('🔐 Google OAuth configured with redirect URI:', GOOGLE_REDIRECT_URI);

const googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

/**
 * GET /api/auth/config
 * Get OAuth configuration for mobile apps
 * Returns client IDs without secrets (safe to expose)
 */
router.get('/config', (req: Request, res: Response): void => {
    res.json({
        success: true,
        data: {
            webClientId: GOOGLE_CLIENT_ID,
            androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        },
    });
});

/**
 * GET /api/auth/google
 * Redirect to Google OAuth consent screen
 */
router.get('/google', (req: Request, res: Response): void => {
    const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
        prompt: 'consent',
        redirect_uri: GOOGLE_REDIRECT_URI, // Explicitly set
    });

    console.log('🔗 Redirecting to Google OAuth:', authUrl);
    res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, error } = req.query;

        if (error) {
            console.error('Google OAuth error:', error);
            res.redirect(`${FRONTEND_URL}/login?error=oauth_denied`);
            return;
        }

        if (!code || typeof code !== 'string') {
            res.redirect(`${FRONTEND_URL}/login?error=no_code`);
            return;
        }

        // Exchange code for tokens
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        // Get user info from Google
        const userInfoResponse = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            }
        );

        if (!userInfoResponse.ok) {
            throw new Error('Failed to get user info from Google');
        }

        const googleUser = await userInfoResponse.json() as {
            id: string;
            email: string;
            name: string;
            picture: string;
        };

        // Check if user exists in our database
        let { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', googleUser.id)
            .single();

        if (!existingUser) {
            // Create new user
            const newUser = {
                id: googleUser.id,
                email: googleUser.email,
                full_name: googleUser.name || null,
                avatar_url: googleUser.picture || null,
                business_type: null,
                onboarding_completed: false,
                dark_mode: false,
            };

            const { data, error: insertError } = await supabase
                .from('users')
                .insert(newUser)
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user:', insertError);
                res.redirect(`${FRONTEND_URL}/login?error=create_failed`);
                return;
            }

            existingUser = data;
        }

        // Create a simple token (user ID) for session
        // In production, you'd want to use JWT or proper session management
        const token = existingUser.id;

        // Redirect back to frontend with token
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=callback_failed`);
    }
});

/**
 * POST /api/auth/google
 * Alternative: Verify Google credential token (for @react-oauth/google flow)
 */
router.post('/google', async (req: Request, res: Response): Promise<void> => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).json({ success: false, error: 'No credential provided' });
            return;
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(401).json({ success: false, error: 'Invalid token' });
            return;
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!googleId || !email) {
            res.status(401).json({ success: false, error: 'Missing user info from token' });
            return;
        }

        // Check if user exists
        let { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', googleId)
            .single();

        if (!existingUser) {
            // Create new user
            const newUser = {
                id: googleId,
                email,
                full_name: name || null,
                avatar_url: picture || null,
                business_type: null,
                onboarding_completed: false,
                dark_mode: false,
            };

            const { data, error } = await supabase
                .from('users')
                .insert(newUser)
                .select()
                .single();

            if (error) {
                console.error('Error creating user:', error);
                res.status(500).json({ success: false, error: 'Failed to create user' });
                return;
            }

            existingUser = data;
        }

        res.json({
            success: true,
            data: {
                user: existingUser as User,
                token: googleId,
            },
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        res.json({ success: true, data: req.user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to get profile' });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { full_name, business_type, onboarding_completed, dark_mode, avatar_url, occupation, monthly_budget } = req.body as UpdateProfileRequest;

        const updateData: Partial<User> = {
            updated_at: new Date().toISOString(),
        };

        if (full_name !== undefined) updateData.full_name = full_name;
        if (business_type !== undefined) updateData.business_type = business_type;
        if (onboarding_completed !== undefined) updateData.onboarding_completed = onboarding_completed;
        if (dark_mode !== undefined) updateData.dark_mode = dark_mode;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        if (occupation !== undefined) updateData.occupation = occupation;
        if (monthly_budget !== undefined) updateData.monthly_budget = monthly_budget;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ success: false, error: 'Failed to update profile' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

/**
 * POST /api/auth/logout
 * Logout (clear session on client side)
 */
router.post('/logout', (req: Request, res: Response): void => {
    res.json({ success: true, message: 'Logged out' });
});

/**
 * DELETE /api/auth/account
 * Delete user account and all associated data
 */
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        console.log(`🗑️ Deleting account for user: ${userId}`);

        // Delete user's expenses first (foreign key constraint)
        const { error: expensesError } = await supabase
            .from('expenses')
            .delete()
            .eq('user_id', userId);

        if (expensesError) {
            console.error('Error deleting expenses:', expensesError);
        }

        // Delete user's custom categories
        const { error: categoriesError } = await supabase
            .from('categories')
            .delete()
            .eq('user_id', userId);

        if (categoriesError) {
            console.error('Error deleting categories:', categoriesError);
        }

        // Delete the user record
        const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) {
            console.error('Error deleting user:', userError);
            res.status(500).json({ success: false, error: 'Failed to delete account' });
            return;
        }

        console.log(`✅ Account deleted successfully for user: ${userId}`);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete account' });
    }
});

export default router;

