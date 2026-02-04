
export type PoseCategory = 'Standing' | 'Seated' | 'Kneeling' | 'Inversion' | 'Prone' | 'Supine' | 'Balance';

export interface YogaPose {
  id: string;
  name: string;
  category: PoseCategory;
  duration: string;
  description: string;
  benefits: string;
  breathingGuidance: string;
  imageUrl?: string; // Added for visual demonstrations
}

export interface YogaSequence {
  title: string;
  description: string;
  poses: YogaPose[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
