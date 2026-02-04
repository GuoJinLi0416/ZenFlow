
import React from 'react';
import { Timer, Wind, Sparkles } from 'lucide-react';
import { YogaPose } from '../types';

interface PoseCardProps {
  pose: YogaPose;
  index: number;
}

const PoseCard: React.FC<PoseCardProps> = ({ pose, index }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            {index + 1}
          </div>
          <h3 className="text-xl font-bold text-stone-800">{pose.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-stone-400 bg-stone-50 px-3 py-1 rounded-full text-xs font-medium">
          <Timer className="w-3 h-3" />
          {pose.duration}
        </div>
      </div>

      <p className="text-stone-600 text-sm leading-relaxed mb-6">
        {pose.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
        <div className="bg-stone-50 p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Benefits</span>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2">{pose.benefits}</p>
        </div>
        <div className="bg-sky-50 p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-sky-700 mb-1">
            <Wind className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Breathing</span>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2">{pose.breathingGuidance}</p>
        </div>
      </div>
    </div>
  );
};

export default PoseCard;
