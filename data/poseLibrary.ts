
import { YogaPose } from '../types';

// Using high-quality placeholder images to simulate the look of dynamic demonstrations
const getYogaImg = (seed: string) => `https://loremflickr.com/600/400/yoga,asana,${seed}?random=${seed}`;

export const POSE_LIBRARY: YogaPose[] = [
  // Standing
  { id: 'tadasana', name: 'Mountain Pose (Tadasana)', category: 'Standing', duration: '1 min', description: 'Standing tall with feet together.', benefits: 'Improves posture and balance.', breathingGuidance: 'Deep, steady inhales.', imageUrl: getYogaImg('mountain') },
  { id: 'vrikshasana', name: 'Tree Pose (Vrikshasana)', category: 'Balance', duration: '30s each side', description: 'Balance on one leg, other foot on inner thigh.', benefits: 'Strengthens legs and focus.', breathingGuidance: 'Focus on a single point.', imageUrl: getYogaImg('tree') },
  { id: 'virabhadrasana1', name: 'Warrior I', category: 'Standing', duration: '45s', description: 'Deep lunge with arms raised high.', benefits: 'Builds stamina and core strength.', breathingGuidance: 'Inhale as you reach up.', imageUrl: getYogaImg('warrior1') },
  { id: 'virabhadrasana2', name: 'Warrior II', category: 'Standing', duration: '45s', description: 'Lunge with arms spread wide.', benefits: 'Opens hips and chest.', breathingGuidance: 'Exhale as you sink deeper.', imageUrl: getYogaImg('warrior2') },
  { id: 'trikonasana', name: 'Triangle Pose', category: 'Standing', duration: '1 min', description: 'Extended legs with one hand reaching for the floor.', benefits: 'Stretches spine and legs.', breathingGuidance: 'Breathe into the side body.', imageUrl: getYogaImg('triangle') },
  
  // Kneeling
  { id: 'marjaryasana', name: 'Cat-Cow Stretch', category: 'Kneeling', duration: '2 mins', description: 'Flowing between arched and rounded spine.', benefits: 'Warms up the spine.', breathingGuidance: 'Inhale to arch, exhale to round.', imageUrl: getYogaImg('catcow') },
  { id: 'balasana', name: 'Child’s Pose', category: 'Kneeling', duration: '2 mins', description: 'Resting with forehead on mat.', benefits: 'Calms the nervous system.', breathingGuidance: 'Slow, deep belly breaths.', imageUrl: getYogaImg('child') },
  { id: 'adho_mukha', name: 'Downward Dog', category: 'Inversion', duration: '1 min', description: 'Inverted V-shape with hands and feet on floor.', benefits: 'Full body stretch.', breathingGuidance: 'Push through the palms on exhale.', imageUrl: getYogaImg('downdog') },
  
  // Seated
  { id: 'paschimottanasana', name: 'Seated Forward Fold', category: 'Seated', duration: '2 mins', description: 'Folding forward over extended legs.', benefits: 'Stretches the hamstrings.', breathingGuidance: 'Exhale as you fold.', imageUrl: getYogaImg('forwardfold') },
  { id: 'baddha_konasana', name: 'Butterfly Pose', category: 'Seated', duration: '2 mins', description: 'Feet together, knees dropped to sides.', benefits: 'Opens inner thighs.', breathingGuidance: 'Gently flap the "wings" with breath.', imageUrl: getYogaImg('butterfly') },
  { id: 'sukhasana', name: 'Easy Pose', category: 'Seated', duration: '5 mins', description: 'Cross-legged sitting for meditation.', benefits: 'Promotes stillness.', breathingGuidance: 'Natural, unforced breath.', imageUrl: getYogaImg('easy') },

  // Supine/Prone
  { id: 'bhujangasana', name: 'Cobra Pose', category: 'Prone', duration: '30s', description: 'Lifting chest off the floor.', benefits: 'Strengthens the back.', breathingGuidance: 'Inhale as you lift.', imageUrl: getYogaImg('cobra') },
  { id: 'setu_bandha', name: 'Bridge Pose', category: 'Supine', duration: '1 min', description: 'Lifting hips with feet flat.', benefits: 'Energizes the body.', breathingGuidance: 'Exhale to lower down.', imageUrl: getYogaImg('bridge') },
  { id: 'shavasana', name: 'Corpse Pose (Shavasana)', category: 'Supine', duration: '5 mins', description: 'Lying flat on the back, total relaxation.', benefits: 'Final integration.', breathingGuidance: 'Let go of all control.', imageUrl: getYogaImg('shavasana') }
];
