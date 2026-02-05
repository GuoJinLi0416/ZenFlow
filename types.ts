
export type PoseCategory = 'Standing' | 'Seated' | 'Kneeling' | 'Inversion' | 'Prone' | 'Supine' | 'Balance';
export type PoseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface YogaPose {
  id: string;
  name: string;
  category: PoseCategory;
  difficulty: PoseDifficulty;
  intensity: number; // 1-10
  duration: string;
  description: string;
  benefits: string;
  breathingGuidance: string;
  imageUrl?: string;
  imagePrompt?: string; 
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
