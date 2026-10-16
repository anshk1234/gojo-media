# Gojo Media

Gojo Media is a web application that provides a single, unified feed of curated public posts from X, Reddit, YouTube, Instagram, and LinkedIn based on topics you choose. Posts are rendered exclusively through each platform's official embed player or widget, without re-hosting or scraping content.

---

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

3. Provide API keys in `.env.local` (optional for local development):
   - `YOUTUBE_API_KEY`: YouTube Data API v3 key for live video queries.
   - `META_APP_TOKEN`: Meta Graph API App Access Token for Instagram oEmbed.
   - `CACHE_TTL_SECONDS`: In-memory cache duration (defaults to 600 seconds).

   *Note: If API keys are omitted or rate-limited, the application runs using curated fallback seed posts.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Add an Interest Topic

Interests are configured declaratively in [`config/interests.ts`](config/interests.ts). Adding a topic requires zero component modifications:

1. Open `config/interests.ts`.
2. Append a new object to the `INTERESTS` array conforming to the `Interest` interface:

```typescript
{
  id: 'distributed-systems',
  label: 'Distributed Systems',
  description: 'Consensus algorithms, replication topologies, and fault tolerance.',
  group: 'Technology',
  sources: {
    subreddits: ['distributedsystems', 'compsci'],
    youtubeQueries: ['Distributed systems consensus lecture', 'Raft algorithm explained'],
    xHandles: ['aphyr', 'heidihoward'],
    instagramUrls: [],
    linkedInUrls: [],
  },
}
```

3. Save the file. The new topic will appear automatically in the onboarding topic picker, the filter bar, and the sidebar.

---

## How to Add a New Platform Adapter

Every platform adapter implements the `SourceAdapter` interface in `lib/sources/adapter.interface.ts`.

To add a new platform (e.g. Bluesky, Threads, or Mastodon):

1. **Add the Platform to Types**:
   In `types/post.ts`, add the platform name to `Platform` and its embed variant to `EmbedType`.

2. **Create the Adapter Class**:
   Create a new file in `lib/sources/{platform}.ts`:
   ```typescript
   import { SourceAdapter } from './adapter.interface';
   import { Interest } from '@/types/interests';
   import { NormalizedPost } from '@/types/post';

   export class BlueskyAdapter implements SourceAdapter {
     readonly platform = 'bluesky' as const;

     async fetch(interest: Interest): Promise<NormalizedPost[]> {
       // 1. Check required environment variables
       // 2. Fetch public posts or oEmbed
       // 3. Return NormalizedPost[] or [] on error
       return [];
     }
   }
   ```

3. **Register the Adapter**:
   In `lib/sources/index.ts`, instantiate and add the new adapter to the `adapters` map.

4. **Add the Embed Component**:
   In `components/embeds/{Platform}Embed.tsx`, create the lazy-loaded embed with an `EmbedFallback` handler. Then route to it inside `components/embeds/PostEmbed.tsx`.

---

## Architecture

- **`config/interests.ts`**: Central topic registry with per-platform source rules.
- **`lib/sources/`**: Platform-specific adapters that fetch and normalize posts.
- **`lib/ranking/`**: Engagement normalization, recency decay, deduplication, and platform interleaving.
- **`lib/cache/`**: Server-side in-memory cache with TTL.
- **`data/seed-posts.ts`**: Fallback dataset for offline development and missing API credentials.
- **`components/embeds/`**: Isolated official embed components with skeleton loaders.
- **`app/api/feed/route.ts`**: Server-side route handler with cursor pagination.

---

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Run ESLint checks
