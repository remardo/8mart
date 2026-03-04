import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

export async function POST(request: NextRequest) {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { photoId, vote } = body;

    if (!photoId || vote === undefined) {
      return NextResponse.json({ error: 'Missing photoId or vote' }, { status: 400 });
    }

    const votesKey = `votes:${photoId}`;
    const currentVotes = parseInt(await redis.get(votesKey) || '0', 10);
    
    let newVotes: number;
    if (vote === true) {
      newVotes = currentVotes + 1;
    } else if (vote === false) {
      newVotes = Math.max(0, currentVotes - 1);
    } else {
      newVotes = currentVotes;
    }
    
    await redis.set(votesKey, newVotes.toString());
    
    return NextResponse.json({ success: true, votes: newVotes });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

export async function GET() {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  try {
    const keys = await redis.keys('votes:*');
    const votes: Record<string, number> = {};
    
    for (const key of keys) {
      const photoId = key.replace('votes:', '');
      votes[photoId] = parseInt(await redis.get(key) || '0', 10);
    }
    
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 });
  }
}
