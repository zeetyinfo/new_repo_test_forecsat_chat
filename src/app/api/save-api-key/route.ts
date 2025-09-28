import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    // In a real application, you would encrypt and save the API key to a secure storage.
    // For this example, we'll just log it to the console.
    console.log(`Received API Key: ${apiKey}`);

    // Here, you would implement the logic to securely store the API key.
    // For example, using a secure vault or a database with encryption.

    return NextResponse.json({ message: 'API Key saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json({ message: 'Error saving API key' }, { status: 500 });
  }
}
