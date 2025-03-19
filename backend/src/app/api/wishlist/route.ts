import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.url || !data.name) {
            return NextResponse.json(
                { error: 'URL and name are required fields' },
                { status: 400 }
            );
        }

        const wish = {
            url: data.url,
            name: data.name,
            comment: data.comment || ''
        };

        const client = await clientPromise;
        const db = client.db('WebApp');

        const result = await db.collection('app_wishlist').insertOne(wish);

        return NextResponse.json({
            success: true,
            id: result.insertedId,
            message: 'App wish submitted successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({
            error: 'Failed to submit app wish'
        }, { status: 500 });
    }
}