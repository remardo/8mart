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

    const votedCookie = request.cookies.get('user_votes');
    let userVotes: Record<string, boolean> = {};
    if (votedCookie) {
      try {
        userVotes = JSON.parse(votedCookie.value);
      } catch (e) { }
    }

    const previousVote = userVotes[photoId];

    if (previousVote === vote) {
      return NextResponse.json({ error: 'Already voted this way' }, { status: 400 });
    }

    const votesKey = `votes:${photoId}`;
    const currentVotesStr = await redis.get(votesKey);
    let currentVotes = parseInt(currentVotesStr || '0', 10);

    let delta = 0;
    if (vote === true) {
      if (previousVote !== true) {
        delta = 1;
      }
    } else if (vote === false) {
      if (previousVote === true) {
        delta = -1;
      }
    }

    let newVotes = Math.max(0, currentVotes + delta);

    await redis.set(votesKey, newVotes.toString());

    userVotes[photoId] = vote;

    const response = NextResponse.json({ success: true, votes: newVotes, userVotes });
    response.cookies.set('user_votes', JSON.stringify(userVotes), {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  try {
    const keys = await redis.keys('votes:*');
    const votes: Record<string, number> = {};

    if (keys.length > 0) {
      for (const key of keys) {
        const photoId = key.replace('votes:', '');
        const currentVoteStr = await redis.get(key);
        votes[photoId] = parseInt(currentVoteStr || '0', 10);
      }
    }

    const votedCookie = request.cookies.get('user_votes');
    let userVotes: Record<string, boolean> = {};
    if (votedCookie) {
      try {
        userVotes = JSON.parse(votedCookie.value);
      } catch (e) { }
    }

    return NextResponse.json({ votes, userVotes });
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 });
  }
}
