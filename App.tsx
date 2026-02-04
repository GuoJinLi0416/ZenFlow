
import React, { useState, useMemo } from 'react';
import { 
  Send, RotateCcw, AlertCircle, Loader2, Sparkles, 
  Leaf, Volume2, Square, Waves, Plus, X, ArrowDown, 
  Search, Play, Trash2, Eye, ChevronUp, ChevronDown, Wind, Info, GripVertical,
  BookOpen, Mic2
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
import { generateYogaSequence, generateYogaAudio, PracticeGuidance } from './services/yogaService';
import { audioPlayer } from './services/audioService';
import { POSE_LIBRARY } from './data/poseLibrary';
import { YogaPose, AppStatus, PoseCategory } from './types';

// --- Sortable Item Component ---
interface SortablePoseProps {
  pose: YogaPose & { canvasId: string };
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full flex flex-col items-center">
      <div className="w-full bg-white rounded-3xl p-4 shadow-md border border-stone-200 flex items-center gap-5 group relative animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-stone-50 rounded-lg text-stone-300 group-hover:text-stone-400 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-100 shadow-inner">
          <img src={pose.imageUrl} alt={pose.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-400">
              {index + 1}
            </span>
            <h3 className="text-lg font-bold text-stone-800 truncate">{pose.name}</h3>
            <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full uppercase">{pose.duration}</span>
          </div>
          <p className="text-xs text-stone-400 line-clamp-1 italic">{pose.breathingGuidance}</p>
          <p className="text-sm text-stone-500 line-clamp-1 mt-1">{pose.description}</p>
        </div>

        <button 
          onClick={() => onRemove(pose.canvasId)}
          className="p-2 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
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

// --- Main App Component ---
const App: React.FC = () => {
  const [canvasPoses, setCanvasPoses] = useState<(YogaPose & { canvasId: string })[]>([]);
  const [sequenceInfo, setSequenceInfo] = useState({ title: 'New Sequence', description: 'Start adding poses or ask AI to help.' });
  const [aiInput, setAiInput] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PoseCategory | 'All'>('All');
  const [previewPose, setPreviewPose] = useState<YogaPose | null>(null);
  const [practiceScript, setPracticeScript] = useState<string | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredLibrary = useMemo(() => {
    return POSE_LIBRARY.filter(pose => {
      const matchesSearch = pose.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || pose.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const addToCanvas = (pose: YogaPose) => {
    const instance = { ...pose, canvasId: Math.random().toString(36).substr(2, 9) };
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
    setSequenceInfo({ title: 'New Sequence', description: 'Start adding poses or ask AI to help.' });
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
      const instances = result.poses.map(p => ({ 
        ...p, 
        canvasId: Math.random().toString(36).substr(2, 9),
        imageUrl: POSE_LIBRARY.find(lp => lp.name.toLowerCase() === p.name.toLowerCase())?.imageUrl || `https://loremflickr.com/600/400/yoga,asana?random=${p.id}`
      }));
      setCanvasPoses(instances);
      setSequenceInfo({ title: result.title, description: result.description });
      setStatus(AppStatus.IDLE);
      setAiInput('');
    } catch (err) {
      console.error(err);
      setError('AI could not generate the flow. Try a different request.');
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
      console.error(err);
      setError('Practice generation failed. Please try again.');
      setIsAudioLoading(false);
      setIsPlaying(false);
    }
  };

  const categories: (PoseCategory | 'All')[] = ['All', 'Standing', 'Seated', 'Kneeling', 'Inversion', 'Balance', 'Supine', 'Prone'];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Pose Library */}
        <aside className="w-80 border-r border-stone-200 flex flex-col bg-white">
          <div className="p-4 border-b border-stone-100 space-y-4">
            <h2 className="text-lg font-bold text-stone-800">Pose Library</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search poses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                    activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredLibrary.map(pose => (
              <div 
                key={pose.id}
                className="group p-2 border border-stone-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center gap-3"
              >
                <div 
                  onClick={() => setPreviewPose(pose)}
                  className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0"
                >
                  <img src={pose.imageUrl} alt={pose.name} className="w-full h-full object-cover" />
                </div>
                <div onClick={() => addToCanvas(pose)} className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-800 truncate">{pose.name}</p>
                  <p className="text-[10px] text-stone-400 font-medium">{pose.category}</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewPose(pose); }}
                    className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => addToCanvas(pose)}
                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 flex flex-col bg-[#FDFCFB] relative">
          <div className="px-8 py-6 border-b border-stone-200 bg-white/50 backdrop-blur-sm flex items-center justify-between z-30 shadow-sm">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">{sequenceInfo.title}</h1>
              <p className="text-sm text-stone-500">{sequenceInfo.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <div className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-3 py-2 rounded-xl border border-red-100 animate-in fade-in zoom-in-95">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
              <button 
                onClick={clearCanvas}
                className="flex items-center gap-2 px-4 py-2 text-stone-400 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <button 
                onClick={handleStartPractice}
                disabled={canvasPoses.length === 0 || isAudioLoading}
                className={`${
                  isPlaying ? 'bg-stone-800' : 'bg-emerald-600'
                } text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]`}
              >
                {isAudioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isPlaying ? 'Stop Guide' : 'Practice Flow'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px]">
            {canvasPoses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-stone-400 flex items-center justify-center">
                   <Plus className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-stone-500 font-medium">Add poses to build your flow<br/>Drag to reorder anytime</p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto pb-24">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={canvasPoses.map(p => p.canvasId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {canvasPoses.map((pose, idx) => (
                      <SortablePoseCard 
                        key={pose.canvasId} 
                        pose={pose} 
                        index={idx} 
                        onRemove={removeFromCanvas}
                        isLast={idx === canvasPoses.length - 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          {/* Practice Overlay / Instructions Display */}
          {isPlaying && practiceScript && (
            <div className="absolute inset-x-0 bottom-[104px] z-40 px-12 pb-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-emerald-100 shadow-2xl rounded-[2.5rem] p-8 flex gap-6 items-start">
                <div className="bg-emerald-600 p-4 rounded-3xl text-white shadow-lg animate-pulse">
                  <Mic2 className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">AI Instructor Guidance</span>
                    <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '0ms'}}></span>
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '200ms'}}></span>
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '400ms'}}></span>
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar pr-4">
                    <p className="text-stone-700 font-medium leading-relaxed italic text-lg">
                      {practiceScript}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Chat Bar */}
          <div className="p-6 bg-white border-t border-stone-200 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-20">
             <form onSubmit={handleAiGenerate} className="max-w-4xl mx-auto flex gap-4">
                <div className="relative flex-1">
                  <Sparkles className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="AI Yoga Master: 'Sequence for lower back pain' or 'Energizing morning flow'"
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder:text-stone-400 text-stone-800"
                  />
                  {status === AppStatus.LOADING && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    </div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={!aiInput.trim() || status === AppStatus.LOADING}
                  className="bg-stone-900 text-white px-10 rounded-2xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Magic Generate
                </button>
             </form>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {previewPose && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative h-[400px] bg-stone-100 overflow-hidden">
              <img src={previewPose.imageUrl} alt={previewPose.name} className="w-full h-full object-cover animate-pulse-slow" />
              <button 
                onClick={() => setPreviewPose(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur shadow-lg rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <X className="w-6 h-6 text-stone-800" />
              </button>
              <div className="absolute bottom-8 left-8 flex items-center gap-3">
                <div className="bg-emerald-600 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                  {previewPose.category}
                </div>
                <div className="bg-white/90 backdrop-blur px-5 py-2 rounded-full text-xs font-bold text-stone-800 shadow-lg flex items-center gap-2">
                  <Play className="w-3 h-3 fill-current" />
                  Live Demonstration
                </div>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-stone-900 mb-3">{previewPose.name}</h2>
                  <p className="text-stone-500 leading-relaxed text-lg">{previewPose.description}</p>
                </div>
                <div className="text-right flex-shrink-0 bg-stone-50 p-4 rounded-3xl border border-stone-100">
                  <div className="text-emerald-600 font-black text-3xl leading-none">{previewPose.duration}</div>
                  <div className="text-stone-400 text-[10px] font-black uppercase tracking-wider mt-1">Practice Time</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-stone-50 p-6 rounded-[2rem] space-y-3 border border-stone-100">
                  <div className="flex items-center gap-2 text-stone-800">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Therapeutic Benefits</span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{previewPose.benefits}</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-[2rem] space-y-3 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <Wind className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pranayama Guidance</span>
                  </div>
                  <p className="text-sm text-emerald-800 leading-relaxed">{previewPose.breathingGuidance}</p>
                </div>
              </div>

              <button 
                onClick={() => { addToCanvas(previewPose); setPreviewPose(null); }}
                className="w-full bg-stone-900 text-white py-5 rounded-[2rem] font-bold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98]"
              >
                <Plus className="w-6 h-6" />
                Add to Sequence
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.98; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
