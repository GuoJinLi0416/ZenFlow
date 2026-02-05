
import React, { useState, useMemo } from 'react';
import { 
  Loader2, Sparkles, Plus, X, ArrowDown, 
  Search, Play, Trash2, Eye, Wind, GripVertical,
  BookOpen, Mic2, Heart, Image as ImageIcon, AlertTriangle, Square
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import Header from './components/Header';
import { generateYogaSequence, generateYogaAudio, generatePoseImage, PracticeGuidance } from './services/yogaService';
import { audioPlayer } from './services/audioService';
import { POSE_LIBRARY } from './data/poseLibrary';
import { YogaPose, AppStatus, PoseCategory } from './types';

type CanvasPose = YogaPose & { canvasId: string; imageLoading?: boolean; imageError?: boolean };

// --- Anatomical Logic ---
const checkAnatomicalSafety = (pose: CanvasPose, index: number): string | null => {
  if (index === 0) {
    if (pose.difficulty === 'Advanced' || pose.intensity > 7) {
      return "Safety Alert: This advanced pose is high-intensity for a start. Consider beginning with a gentle warmup like Child's Pose to prevent injury.";
    }
    if (pose.category === 'Inversion') {
      return "Anatomical Warning: Starting with an inversion requires significant warmup. Start with grounding poses first.";
    }
  }
  if (index < 2 && pose.difficulty === 'Advanced') {
    return "Caution: Your body may not be warm enough for this peak pose yet.";
  }
  return null;
};

// --- Sortable Item Component ---
interface SortablePoseProps {
  pose: CanvasPose;
  index: number;
  onRemove: (id: string) => void;
  isLast: boolean;
}

const SortablePoseCard: React.FC<SortablePoseProps> = ({ pose, index, onRemove, isLast }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pose.canvasId });

  const safetyWarning = useMemo(() => checkAnatomicalSafety(pose, index), [pose, index]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full flex flex-col items-center">
      {safetyWarning && (
        <div className="w-full mb-3 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-amber-800 leading-relaxed">{safetyWarning}</p>
        </div>
      )}
      
      <div className={`w-full bg-white rounded-[2rem] p-5 shadow-sm border ${safetyWarning ? 'border-amber-300 ring-2 ring-amber-50' : 'border-stone-200'} flex items-center gap-6 group relative animate-in fade-in slide-in-from-top-2 duration-300 hover:shadow-md transition-shadow`}>
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-stone-50 rounded-lg text-stone-300 group-hover:text-stone-400 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-100 shadow-inner flex items-center justify-center relative group">
          {pose.imageLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">AI Drawing...</span>
            </div>
          ) : pose.imageUrl ? (
            <img 
              src={pose.imageUrl} 
              alt={pose.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-stone-200" />
          )}
          {pose.imageLoading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-600 border border-emerald-100">
              {index + 1}
            </span>
            <h3 className="text-xl font-bold text-stone-800 truncate tracking-tight">{pose.name}</h3>
            <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{pose.duration}</span>
          </div>
          <div className="flex gap-2 mb-2">
             <span className="text-[9px] font-bold uppercase text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">{pose.category}</span>
             <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
               pose.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-500' : 
               pose.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-500' : 
               'bg-blue-50 text-blue-500'
             }`}>{pose.difficulty}</span>
          </div>
          <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{pose.description}</p>
        </div>

        <button 
          onClick={() => onRemove(pose.canvasId)}
          className="p-3 rounded-2xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {!isLast && !isDragging && (
        <div className="my-2 text-stone-200">
          <ArrowDown className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [canvasPoses, setCanvasPoses] = useState<CanvasPose[]>([]);
  const [sequenceInfo, setSequenceInfo] = useState({ title: 'ZenFlow Personalized', description: 'Enter your physical focus to begin.' });
  const [aiInput, setAiInput] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PoseCategory | 'All'>('All');
  const [previewPose, setPreviewPose] = useState<YogaPose | null>(null);
  const [practiceScript, setPracticeScript] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredLibrary = useMemo(() => {
    return POSE_LIBRARY.filter(pose => {
      const matchesSearch = pose.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || pose.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const addToCanvas = (pose: YogaPose) => {
    const instance = { ...pose, canvasId: Math.random().toString(36).substr(2, 9), imageLoading: false };
    setCanvasPoses([...canvasPoses, instance]);
  };

  const removeFromCanvas = (canvasId: string) => {
    setCanvasPoses(canvasPoses.filter((p) => p.canvasId !== canvasId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCanvasPoses((items) => {
        const oldIndex = items.findIndex((i) => i.canvasId === active.id);
        const newIndex = items.findIndex((i) => i.canvasId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const clearCanvas = () => {
    setCanvasPoses([]);
    setSequenceInfo({ title: 'ZenFlow Personalized', description: 'Enter your physical focus to begin.' });
    setPracticeScript(null);
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setPracticeScript(null);
    
    try {
      const result = await generateYogaSequence(aiInput);
      
      const newPoses: CanvasPose[] = result.poses.map(p => {
        const libraryMatch = POSE_LIBRARY.find(lp => 
          lp.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lp.name.toLowerCase())
        );
        
        return { 
          ...p, 
          canvasId: Math.random().toString(36).substr(2, 9),
          imageUrl: libraryMatch?.imageUrl,
          imageLoading: !libraryMatch,
          imagePrompt: p.imagePrompt,
          // Merge anatomical metadata if found in library
          difficulty: libraryMatch?.difficulty || 'Intermediate',
          intensity: libraryMatch?.intensity || 5
        };
      });

      setCanvasPoses(newPoses);
      setSequenceInfo({ title: result.title, description: result.description });
      setStatus(AppStatus.IDLE);
      setAiInput('');

      newPoses.forEach(async (pose) => {
        if (!pose.imageUrl || pose.imageLoading) {
          try {
            const aiImageUrl = await generatePoseImage(pose.imagePrompt || pose.name);
            setCanvasPoses(prev => prev.map(p => 
              p.canvasId === pose.canvasId ? { ...p, imageUrl: aiImageUrl, imageLoading: false } : p
            ));
          } catch (imgErr) {
            setCanvasPoses(prev => prev.map(p => 
              p.canvasId === pose.canvasId ? { ...p, imageLoading: false, imageError: true } : p
            ));
          }
        }
      });

    } catch (err) {
      setError('Connection timeout or AI error. Please try again.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleStartPractice = async () => {
    if (canvasPoses.length === 0 || isAudioLoading) return;
    if (isPlaying) { 
      audioPlayer.stop(); 
      setIsPlaying(false); 
      setPracticeScript(null);
      return; 
    }

    setIsAudioLoading(true);
    setError(null);
    try {
      const guidance: PracticeGuidance = await generateYogaAudio(sequenceInfo.title, canvasPoses);
      setPracticeScript(guidance.script);
      setIsAudioLoading(false);
      setIsPlaying(true);
      await audioPlayer.play(guidance.audioBase64);
      setIsPlaying(false);
      setPracticeScript(null);
    } catch (err) {
      setError('Audio session could not be established.');
      setIsAudioLoading(false);
      setIsPlaying(false);
    }
  };

  const categories: (PoseCategory | 'All')[] = ['All', 'Standing', 'Seated', 'Kneeling', 'Inversion', 'Balance', 'Supine', 'Prone'];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-stone-200 flex flex-col bg-white">
          <div className="p-5 border-b border-stone-100 space-y-4">
            <h2 className="text-xl font-bold text-stone-800 tracking-tight">Pose Library</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search asanas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    activeCategory === cat ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {filteredLibrary.map(pose => (
              <div 
                key={pose.id}
                className="group p-2.5 border border-stone-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center gap-3"
              >
                <div onClick={() => setPreviewPose(pose)} className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  <img src={pose.imageUrl} alt={pose.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div onClick={() => addToCanvas(pose)} className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-800 truncate leading-tight mb-0.5">{pose.name}</p>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-tighter">{pose.difficulty} • {pose.category}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => setPreviewPose(pose)} className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-400 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => addToCanvas(pose)} className="p-1.5 rounded-lg hover:bg-emerald-500 hover:text-white text-emerald-600 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-[#FDFCFB] relative">
          <div className="px-10 py-8 border-b border-stone-200 bg-white/70 backdrop-blur-xl flex items-center justify-between z-30 shadow-sm">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-stone-900 leading-none tracking-tight">{sequenceInfo.title}</h1>
              <p className="text-stone-500 font-medium">{sequenceInfo.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={clearCanvas} className="p-3 text-stone-400 hover:text-red-500 transition-colors bg-white border border-stone-200 rounded-2xl shadow-sm">
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleStartPractice}
                disabled={canvasPoses.length === 0 || isAudioLoading}
                className={`${isPlaying ? 'bg-stone-900' : 'bg-emerald-600'} text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 disabled:opacity-50`}
              >
                {isAudioLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isPlaying ? 'End Session' : 'Start Flow'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px]">
            {canvasPoses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-[3rem] border-2 border-dashed border-stone-300 flex items-center justify-center bg-white shadow-inner">
                   <Plus className="w-10 h-10 text-stone-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-stone-400">Empty Flow</h3>
                  <p className="text-stone-400 mt-2">Add poses to build your anatomical sequence.</p>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto pb-48">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={canvasPoses.map(p => p.canvasId)} strategy={verticalListSortingStrategy}>
                    {canvasPoses.map((pose, idx) => (
                      <SortablePoseCard key={pose.canvasId} pose={pose} index={idx} onRemove={removeFromCanvas} isLast={idx === canvasPoses.length - 1} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          <div className="p-8 bg-white border-t border-stone-200 shadow-2xl z-20">
             <form onSubmit={handleAiGenerate} className="max-w-5xl mx-auto flex gap-6">
                <div className="relative flex-1">
                  <Sparkles className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Describe your feelings... AI will handle anatomical safety."
                    className="w-full pl-14 pr-4 py-5 bg-stone-50 border-2 border-transparent rounded-[2rem] focus:outline-none focus:border-emerald-500 shadow-inner text-lg font-medium"
                  />
                  {status === AppStatus.LOADING && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={!aiInput.trim() || status === AppStatus.LOADING}
                  className="bg-emerald-600 text-white px-12 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Generate Flow
                </button>
             </form>
          </div>
        </main>
      </div>

      {previewPose && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[800px]">
            <div className="flex-1 bg-stone-100 relative group overflow-hidden h-1/2 md:h-full">
              <img src={previewPose.imageUrl} alt={previewPose.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-10 left-10 text-white space-y-2">
                <div className="flex gap-2">
                  <span className="bg-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{previewPose.difficulty}</span>
                </div>
                <h2 className="text-5xl font-bold tracking-tighter">{previewPose.name}</h2>
              </div>
              <button onClick={() => setPreviewPose(null)} className="absolute top-8 right-8 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-xl text-white rounded-[2rem] flex items-center justify-center">
                <X className="w-7 h-7" />
              </button>
            </div>
            <div className="w-full md:w-[450px] p-12 overflow-y-auto custom-scrollbar flex flex-col justify-between">
              <div className="space-y-10">
                <p className="text-stone-600 text-lg leading-relaxed">{previewPose.description}</p>
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="w-5 h-5 text-rose-400" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Why Practice?</span>
                    </div>
                    <p className="text-stone-500 text-sm leading-relaxed">{previewPose.benefits}</p>
                  </div>
                </div>
              </div>
              <div className="pt-10 flex gap-4">
                <button 
                  onClick={() => { addToCanvas(previewPose); setPreviewPose(null); }}
                  className="flex-1 bg-stone-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest h-16 flex items-center justify-center gap-3"
                >
                  <Plus className="w-6 h-6" />
                  Add to Flow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
