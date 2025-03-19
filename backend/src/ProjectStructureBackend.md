# Project Structure for /Users/oliverstaub/gitroot/luddite-launcher-backend/src

- **app/**
  - **api/**
    - **auth/**
      - **register/**
        - route.ts (1328 bytes)
          - Content preview:
```
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
```
      - route.ts (2800 bytes)
        - Content preview:
```
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = 'luddite-launcher-secret-key';
const TOKEN_EXPIRY = '[REDACTED]';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        console.log('Login attempt:', { username, password: '***' });

        if (!username || !password) {
            return NextResponse.json({
                error: 'Username and password are required'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('Users');

        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        console.log('Looking for user with username:', username);
        const user = await db.collection('users').findOne({ username });

        console.log('User found:', user ? 'Yes' : 'No');

        if (user) {
            console.log('Stored password:', user.password);
            console.log('Provided password:', password);
            console.log('Password match:', user.password === password);
        }

        if (!user || user.password !== password) {
            return NextResponse.json({
                error: 'Invalid username or password'
            }, { status: 401 });
        }

        const payload = {
            sub: user._id.toString(),
            username: user.username,
        };

        const token = sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

        return NextResponse.json({
            success: true,
            token,
            user: {
                username: user.username,
            }
        });

    } catch (error) {
        console.error('Auth Error:', error);
        return NextResponse.json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'No token provided'
            }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        const decoded = verify(token, JWT_SECRET);

        return NextResponse.json({
            success: true,
            user: decoded
        });

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({
            error: 'Invalid or expired token'
        }, { status: 401 });
    }
}
```
    - **nativeapps/**
      - route.ts (528 bytes)
        - Content preview:
```
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
```
    - **webapps/**
      - route.ts (527 bytes)
        - Content preview:
```
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
```
    - **wishlist/**
      - route.ts (1098 bytes)
        - Content preview:
```
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
```
  - favicon.ico (25931 bytes)
  - globals.css (345 bytes)
    - Content preview:
```
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

```
  - layout.tsx (689 bytes)
    - Content preview:
```
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

```
  - page.tsx (3908 bytes)
    - Content preview:
```
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

```
- **lib/**
  - mongodb.ts (992 bytes)
    - Content preview:
```
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
```
- **types/**
  - webApp.ts (102 bytes)
    - Content preview:
```
export interface WebApp {
    _id: string;
    url: string;
    name: string;
    timeLimit: string;
}
```



version: '3.8'

services:
mongodb:
image: mongo:latest
container_name: luddite-mongodb
ports:
- "27017:27017"
environment:
MONGO_INITDB_ROOT_USERNAME: admin
MONGO_INITDB_ROOT_PASSWORD: password
volumes:
- mongodb_data:/data/db
networks:
- luddite-network

mongo-express:
image: mongo-express:latest
container_name: luddite-mongo-express
ports:
- "8081:8081"
environment:
ME_CONFIG_MONGODB_ADMINUSERNAME: admin
ME_CONFIG_MONGODB_ADMINPASSWORD: password
ME_CONFIG_MONGODB_URL: mongodb://admin:password@mongodb:27017/
depends_on:
- mongodb
networks:
- luddite-network

backend:
build:
context: .
dockerfile: Dockerfile
container_name: luddite-backend
ports:
- "3000:3000"
environment:
- NODE_ENV=development
- MONGODB_URI=mongodb://admin:password@mongodb:27017/luddite-launcher?authSource=admin
volumes:
- .:/app
- /app/node_modules
depends_on:
- mongodb
networks:
- luddite-network

networks:
luddite-network:
driver: bridge

volumes:
mongodb_data:








FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the application (for production)
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]