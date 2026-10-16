import { Interest } from '@/types/interests';

export const INTERESTS: Interest[] = [
  {
    id: 'ai-ml',
    label: 'Artificial Intelligence',
    description: 'Breakthroughs in large models, neural architectures, and applied machine learning.',
    group: 'Technology',
    sources: {
      subreddits: ['MachineLearning', 'ArtificialInteligence', 'LocalLLaMA'],
      youtubeQueries: ['AI models deep dive', 'LLM reasoning architecture', 'Machine learning advances'],
      xHandles: ['OpenAI', 'AnthropicAI', 'ylecun', 'karpathy'],
      instagramUrls: [
        'https://www.instagram.com/p/DEi5o1wS4gO/',
        'https://www.instagram.com/p/DB1n0iWygG1/',
      ],
      linkedInUrls: [
        'https://www.linkedin.com/posts/satyanadella_ai-innovation-cloud-activity-7164319875123456789-abcd',
        'https://www.linkedin.com/posts/demishassabis_deepmind-alphafold-science-activity-7153218765432198765-wxyz',
      ],
    },
  },
  {
    id: 'web-dev',
    label: 'Web Engineering',
    description: 'Modern frontend systems, serverless runtimes, performance, and API design.',
    group: 'Technology',
    sources: {
      subreddits: ['webdev', 'reactjs', 'nextjs'],
      youtubeQueries: ['Modern Web Architecture', 'Next.js App Router patterns', 'Frontend engineering masterclass'],
      xHandles: ['rauchg', 'leeerob', 'dan_abramov', 'addyosmani'],
      instagramUrls: [
        'https://www.instagram.com/p/DCm0_oPxFk3/',
      ],
      linkedInUrls: [
        'https://www.linkedin.com/posts/vercel_nextjs-performance-edge-activity-7170123456789123456-efgh',
      ],
    },
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    description: 'Threat intelligence, zero-day vulnerabilities, cryptographic protocols, and system defenses.',
    group: 'Technology',
    sources: {
      subreddits: ['netsec', 'cybersecurity'],
      youtubeQueries: ['Zero day vulnerability analysis', 'Cybersecurity reverse engineering', 'Network defense protocols'],
      xHandles: ['SwiftOnSecurity', 'briankrebs', 'GossiTheDog'],
      instagramUrls: [],
      linkedInUrls: [],
    },
  },
  {
    id: 'ui-ux',
    label: 'Interface Design',
    description: 'Interaction models, typography, spatial hierarchy, design systems, and craft.',
    group: 'Design & Creative',
    sources: {
      subreddits: ['UI_Design', 'userinterface', 'designtools'],
      youtubeQueries: ['Design systems at scale', 'UI micro-interactions critique', 'Typography in digital products'],
      xHandles: ['figma', 'linear', 'brian_lovin', 'mrspecht'],
      instagramUrls: [
        'https://www.instagram.com/p/C_qU345yZ6A/',
      ],
      linkedInUrls: [
        'https://www.linkedin.com/posts/figma_design-systems-variables-activity-7162987654321098765-ijkl',
      ],
    },
  },
  {
    id: 'architecture',
    label: 'Architecture',
    description: 'Structural aesthetics, sustainable materials, urbanism, and spatial proportions.',
    group: 'Design & Creative',
    sources: {
      subreddits: ['ArchitecturePorn', 'architecture'],
      youtubeQueries: ['Architectural documentary modern', 'Sustainable building architecture tour', 'Spatial design philosophies'],
      xHandles: ['ArchDaily', 'dezeen'],
      instagramUrls: [
        'https://www.instagram.com/p/C-iQ9_zS29v/',
      ],
      linkedInUrls: [],
    },
  },
  {
    id: 'startups',
    label: 'Startups & Ventures',
    description: 'Early-stage venture building, distribution mechanics, unit economics, and operator insights.',
    group: 'Business & Careers',
    sources: {
      subreddits: ['startups', 'Entrepreneur'],
      youtubeQueries: ['Y Combinator startup school', 'Founder product market fit lecture', 'SaaS distribution economics'],
      xHandles: ['paulg', 'sama', 'garrytan', 'bchesky'],
      instagramUrls: [],
      linkedInUrls: [
        'https://www.linkedin.com/posts/y-combinator_founder-advice-pmf-activity-7168912345678901234-mnop',
      ],
    },
  },
  {
    id: 'space-exploration',
    label: 'Space Exploration',
    description: 'Astrophysics, orbital mechanics, planetary missions, and deep-space observation.',
    group: 'Science & Space',
    sources: {
      subreddits: ['space', 'Astronomy'],
      youtubeQueries: ['James Webb space telescope discoveries', 'Orbital space launch engineering', 'Deep space exploration updates'],
      xHandles: ['NASA', 'ESA', 'NASAWebb'],
      instagramUrls: [
        'https://www.instagram.com/p/C_N0zL4uA7d/',
      ],
      linkedInUrls: [],
    },
  },
  {
    id: 'cinema',
    label: 'Cinema & Direction',
    description: 'Visual storytelling, editing rhythm, soundscapes, and cinematic direction.',
    group: 'Culture & News',
    sources: {
      subreddits: ['truefilm', 'filmmaking'],
      youtubeQueries: ['Cinematography masterclass framing', 'Visual storytelling film analysis', 'Film sound design analysis'],
      xHandles: ['A24', 'Criterion', 'filmstudies'],
      instagramUrls: [],
      linkedInUrls: [],
    },
  },
  {
    id: 'formula-1',
    label: 'Formula 1',
    description: 'Aerodynamic telemetry, race engineering, tyre degradation strategies, and paddock analysis.',
    group: 'Sports & Fitness',
    sources: {
      subreddits: ['formula1', 'F1Technical'],
      youtubeQueries: ['F1 telemetry analysis technical', 'Formula 1 aerodynamics breakdown', 'F1 race strategy explained'],
      xHandles: ['F1', 'ScuderiaFerrari', 'MercedesAMGF1'],
      instagramUrls: [
        'https://www.instagram.com/p/DAxK0m2sQ81/',
      ],
      linkedInUrls: [],
    },
  },
];

export const INTEREST_GROUPS = Array.from(
  new Set(INTERESTS.map((interest) => interest.group))
);

export function getInterestById(id: string): Interest | undefined {
  return INTERESTS.find((interest) => interest.id === id);
}

export function getInterestsByIds(ids: string[]): Interest[] {
  const set = new Set(ids);
  return INTERESTS.filter((interest) => set.has(interest.id));
}
