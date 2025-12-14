/**
 * Username Suggestions API
 * POST /api/portfolio/username/suggest
 * Generate username suggestions based on name and email
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateUsername } from '@/lib/portfolio';

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const { name, email } = await req.json();

        if (!name && !email) {
            return NextResponse.json(
                { message: 'Name or email is required' },
                { status: 400 }
            );
        }

        const suggestions = await generateUsername(
            name || session.user.name || '',
            email || session.user.email || ''
        );

        return NextResponse.json({
            suggestions,
        });
    } catch (error) {
        console.error('Username suggestion error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
