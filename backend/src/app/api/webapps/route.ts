import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('WebApp');

        const webApps = await db.collection('app_list')
            .find({})
            .toArray();

        return NextResponse.json(webApps);

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch webapps' }, { status: 500 });
    }
}