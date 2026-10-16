import { NextRequest, NextResponse } from 'next/server';
import { getInterestsByIds, INTERESTS } from '@/config/interests';
import { fetchPostsForInterests } from '@/lib/sources';
import { rankAndInterleaveFeed } from '@/lib/ranking';
import { Platform } from '@/types/post';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Parse interests parameter
    const interestsParam = searchParams.get('interests');
    let interestIds = interestsParam ? interestsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];

    // If no interests specified, default to top 3 interests
    if (interestIds.length === 0) {
      interestIds = INTERESTS.slice(0, 3).map((i) => i.id);
    }

    const selectedInterests = getInterestsByIds(interestIds);
    if (selectedInterests.length === 0) {
      return NextResponse.json(
        { error: 'No matching interests found for the specified topics.' },
        { status: 400 }
      );
    }

    // 2. Parse platforms parameter
    const platformsParam = searchParams.get('platforms');
    const allowedPlatforms: Platform[] = ['reddit', 'youtube', 'x', 'instagram', 'linkedin'];
    let platforms: Platform[] | undefined = undefined;

    if (platformsParam) {
      const parsedPlatforms = platformsParam
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((p): p is Platform => allowedPlatforms.includes(p as Platform));

      if (parsedPlatforms.length > 0) {
        platforms = parsedPlatforms;
      }
    }

    // 3. Parse pagination cursor & limit
    const cursorParam = searchParams.get('cursor');
    const offset = cursorParam ? Math.max(0, parseInt(cursorParam, 10) || 0) : 0;
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '8', 10)));

    // 4. Fetch posts via adapters with seed fallback
    const rawPosts = await fetchPostsForInterests(selectedInterests, platforms);

    // 5. Rank, deduplicate, and interleave posts
    const rankedPosts = rankAndInterleaveFeed(rawPosts);

    // 6. Paginate slice
    const pagePosts = rankedPosts.slice(offset, offset + limit);
    const nextOffset = offset + limit;
    const nextCursor = nextOffset < rankedPosts.length ? String(nextOffset) : null;

    return NextResponse.json({
      posts: pagePosts,
      nextCursor,
      total: rankedPosts.length,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to build feed at this time. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
