import { Interest } from '@/types/interests';
import { NormalizedPost, Platform } from '@/types/post';

export interface SourceAdapter {
  readonly platform: Platform;
  fetch(interest: Interest): Promise<NormalizedPost[]>;
}
