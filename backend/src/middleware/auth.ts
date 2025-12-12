import { Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '../config/supabase';
import { AuthRequest, User } from '../types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Middleware to verify Google JWT token or session token
 */
export async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Try to verify as Google token first
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.sub) {
                res.status(401).json({ success: false, error: 'Invalid token payload' });
                return;
            }

            // Get user from database
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', payload.sub)
                .single();

            if (error || !user) {
                res.status(401).json({ success: false, error: 'User not found' });
                return;
            }

            req.user = user as User;
            next();
        } catch (googleError) {
            // If Google verification fails, try as a user ID
            // This is for session-based auth where we store user ID
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', token)
                .single();

            if (error || !user) {
                res.status(401).json({ success: false, error: 'Invalid token' });
                return;
            }

            req.user = user as User;
            next();
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
}

export default authMiddleware;
