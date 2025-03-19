import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({
                error: 'Username and password are required'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('Users');

        const existingUser = await db.collection('users').findOne({ username });

        if (existingUser) {
            return NextResponse.json({
                error: 'Username already exists'
            }, { status: 409 });
        }

        const result = await db.collection('users').insertOne({
            username,
            password, // In real apps, store a hashed password!
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertedId
        }, { status: 201 });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({
            error: 'Registration failed'
        }, { status: 500 });
    }
}