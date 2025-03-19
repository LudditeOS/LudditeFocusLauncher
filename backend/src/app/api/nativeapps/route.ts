import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('NativeApp');

        const apps = await db.collection('app_list')
            .find({})
            .toArray();

        return NextResponse.json(apps);

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch native apps' }, { status: 500 });
    }
}