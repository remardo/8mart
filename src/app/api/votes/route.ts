import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, vote } = body;

    if (!photoId || vote === undefined) {
      return NextResponse.json({ error: 'Missing photoId or vote' }, { status: 400 });
    }

    const votesKey = `votes:${photoId}`;
    const currentVotes = await kv.get<number>(votesKey) || 0;
    
    let newVotes: number;
    if (vote === true) {
      newVotes = currentVotes + 1;
    } else if (vote === false) {
      newVotes = Math.max(0, currentVotes - 1);
    } else {
      newVotes = currentVotes;
    }
    
    await kv.set(votesKey, newVotes);
    
    return NextResponse.json({ success: true, votes: newVotes });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const keys = await kv.keys('votes:*');
    const votes: Record<string, number> = {};
    
    for (const key of keys) {
      const photoId = key.replace('votes:', '');
      votes[photoId] = await kv.get<number>(key) || 0;
    }
    
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 });
  }
}
