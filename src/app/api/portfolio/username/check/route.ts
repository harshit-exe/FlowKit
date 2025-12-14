/**
 * Username Availability Check API
 * GET /api/portfolio/username/check?username=example
 * Check if a username is available
 */

import { NextResponse } from 'next/server';
import { isUsernameAvailable, generateUsername } from '@/lib/portfolio';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json(
                { message: 'Username parameter is required' },
                { status: 400 }
            );
        }

        const available = await isUsernameAvailable(username);

        return NextResponse.json({
            username,
            available,
            message: available ? 'Username is available' : 'Username is already taken',
        });
    } catch (error) {
        console.error('Username check error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
