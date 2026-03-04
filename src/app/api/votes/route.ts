import { NextRequest, NextResponse } from 'next/server';

const votes: Record<string, number> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, vote } = body;

    if (!photoId || vote === undefined) {
      return NextResponse.json({ error: 'Missing photoId or vote' }, { status: 400 });
    }

    const currentVotes = votes[photoId] || 0;
    
    let newVotes: number;
    if (vote === true) {
      newVotes = currentVotes + 1;
    } else if (vote === false) {
      newVotes = Math.max(0, currentVotes - 1);
    } else {
      newVotes = currentVotes;
    }
    
    votes[photoId] = newVotes;
    
    console.log('Vote:', photoId, vote, '->', newVotes);
    
    return NextResponse.json({ success: true, votes: newVotes });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(votes);
}
