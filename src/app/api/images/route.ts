
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
        return new NextResponse('Missing path parameter', { status: 400 });
    }

    // NocoDB Base URL (matches the one used in the curl command)
    const NOCO_BASE_URL = 'https://n8n-nocodb.hvo3jf.easypanel.host';
    const TOKEN = 'J85xPNLm5dtBtEMBYtPRbl0kNSuBzYH53P2sXTHc';

    try {
        // Construct full URL. Path usually starts with "download/..."
        const imageUrl = `${NOCO_BASE_URL}/${path}`;

        const response = await fetch(imageUrl, {
            headers: {
                'xc-token': TOKEN
            }
        });

        if (!response.ok) {
            return new NextResponse(`Error fetching image: ${response.statusText}`, { status: response.status });
        }

        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(blob, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Proxy Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
