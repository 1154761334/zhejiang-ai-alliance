import { NextResponse } from 'next/server';
import { createDirectus, rest, readItems } from '@directus/sdk';

export async function GET() {
    try {
        // Create a fresh client (no caching, no singleton)
        const client = createDirectus('http://localhost:8055').with(rest());

        const articles = await client.request(
            readItems('articles', {
                fields: ['id', 'title', 'slug', 'summary', 'publish_date'],
                sort: ['-publish_date'],
            })
        );

        return NextResponse.json({
            success: true,
            count: articles.length,
            articles
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            errors: error.errors,
            stack: error.stack
        }, { status: 500 });
    }
}
