import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth0.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const accessToken = await auth0.getAccessToken();

        if (!accessToken) {
            return NextResponse.json(
                { error: 'No access token available' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            accessToken: accessToken.token
        });
    } catch (error) {
        console.error('Error getting access token:', error);
        return NextResponse.json(
            { error: 'Failed to get access token' },
            { status: 500 }
        );
    }
}
