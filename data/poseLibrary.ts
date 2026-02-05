
import { YogaPose } from '../types';

const getYogaImg = (poseKeyword: string, seed: string) => 
  `https://loremflickr.com/800/600/yoga,asana,stretching,${poseKeyword.replace(/\s+/g, '').toLowerCase()}?random=${seed}`;

export const POSE_LIBRARY: YogaPose[] = [
  // --- Neck & Shoulder Focus ---
  { 
    id: 'neck-rolls', 
    name: 'Seated Neck Rolls', 
    category: 'Seated', 
    difficulty: 'Beginner',
    intensity: 2,
    duration: '2 mins', 
    description: 'Gently rolling the neck in circular motions while seated comfortably.', 
    benefits: 'Relieves tension in the cervical spine and upper traps.', 
    breathingGuidance: 'Inhale as you look up, exhale as the chin drops to chest.', 
    imageUrl: getYogaImg('neckstretch', 'n1') 
  },
  { 
    id: 'thread-needle', 
    name: 'Thread the Needle', 
    category: 'Kneeling', 
    difficulty: 'Beginner',
    intensity: 4,
    duration: '1 min each side', 
    description: 'From tabletop, slide one arm under the other until the shoulder rests on the mat.', 
    benefits: 'Deep stretch for the shoulders and upper back.', 
    breathingGuidance: 'Exhale as you reach through; breathe into the shoulder blade.', 
    imageUrl: getYogaImg('threadneedle', 'n2') 
  },
  { 
    id: 'puppy-pose', 
    name: 'Extended Puppy Pose', 
    category: 'Kneeling', 
    difficulty: 'Beginner',
    intensity: 4,
    duration: '1.5 mins', 
    description: 'Hips stay over knees as hands walk forward, heart melting toward the earth.', 
    benefits: 'Stretches the spine and opens the shoulders beautifully.', 
    breathingGuidance: 'Deep, slow breaths as the chest descends.', 
    imageUrl: getYogaImg('puppypose', 'n3') 
  },

  // --- Standing ---
  { 
    id: 'tadasana', 
    name: 'Mountain Pose', 
    category: 'Standing', 
    difficulty: 'Beginner',
    intensity: 1,
    duration: '1 min', 
    description: 'Stand with feet together, grounding through all four corners.', 
    benefits: 'Improves posture.', 
    breathingGuidance: 'Inhale to grow tall.', 
    imageUrl: getYogaImg('tadasana', '1') 
  },
  { 
    id: 'virabhadrasana1', 
    name: 'Warrior I', 
    category: 'Standing', 
    difficulty: 'Intermediate',
    intensity: 6,
    duration: '45s', 
    description: 'A powerful lunge with arms reaching toward the sky.', 
    benefits: 'Strengthens legs.', 
    breathingGuidance: 'Expansive inhales.', 
    imageUrl: getYogaImg('warrior1', '2') 
  },

  // --- Balance ---
  { 
    id: 'bakasana', 
    name: 'Crow Pose', 
    category: 'Balance', 
    difficulty: 'Advanced',
    intensity: 8,
    duration: '20s', 
    description: 'An arm balance where knees rest on the back of the upper arms.', 
    benefits: 'Builds arm strength.', 
    breathingGuidance: 'Exhale as you shift weight forward.', 
    imageUrl: getYogaImg('crowpose', 'b3') 
  },

  // --- Inversion ---
  { 
    id: 'sarvangasana', 
    name: 'Shoulder Stand', 
    category: 'Inversion', 
    difficulty: 'Advanced',
    intensity: 9,
    duration: '2 mins', 
    description: 'Lifting the legs and torso toward the ceiling.', 
    benefits: 'Calms the mind.', 
    breathingGuidance: 'Deep slow breathing.', 
    imageUrl: getYogaImg('shoulderstand', 'i3') 
  },

  // --- Relaxation ---
  { 
    id: 'balasana', 
    name: 'Child’s Pose', 
    category: 'Kneeling', 
    difficulty: 'Beginner',
    intensity: 1,
    duration: '2 mins', 
    description: 'Resting the forehead down, sitting back on heels.', 
    benefits: 'Calms the mind.', 
    breathingGuidance: 'Surrender completely.', 
    imageUrl: getYogaImg('childspose', '10') 
  },
  { 
    id: 'shavasana', 
    name: 'Corpse Pose', 
    category: 'Supine', 
    difficulty: 'Beginner',
    intensity: 0,
    duration: '5 mins', 
    description: 'Complete stillness lying flat on the back.', 
    benefits: 'Full body integration.', 
    breathingGuidance: 'Let go.', 
    imageUrl: getYogaImg('shavasana', '20') 
  }
];
