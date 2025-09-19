import { useEffect, useState } from "react";

interface VirtualPetProps {
  mood: number; // 0-7 scale
}

export const VirtualPet = ({ mood }: VirtualPetProps) => {
  const [petState, setPetState] = useState<'sad' | 'neutral' | 'happy'>('neutral');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Map mood to pet state according to requirements
    if (mood <= 2) {
      setPetState('sad');
    } else if (mood <= 4) {
      setPetState('neutral');
    } else {
      setPetState('happy');
    }

    // Trigger animation when mood changes
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [mood]);

  const getPetAppearance = () => {
    switch (petState) {
      case 'sad':
        return {
          body: 'bg-mood-sad',
          eyes: '😔',
          animation: 'animate-pulse',
          accessory: '💧' // tear drop
        };
      case 'neutral':
        return {
          body: 'bg-mood-neutral', 
          eyes: '😐',
          animation: 'animate-gentle-bounce',
          accessory: '💭' // thinking
        };
      case 'happy':
        return {
          body: 'bg-mood-happy',
          eyes: '😊',
          animation: 'animate-float',
          accessory: '✨' // sparkles
        };
    }
  };

  const appearance = getPetAppearance();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Pet Container */}
      <div className="relative">
        {/* Main Pet Body */}
        <div 
          className={`
            w-24 h-24 rounded-full ${appearance.body} 
            flex items-center justify-center text-3xl
            ${isAnimating ? appearance.animation : ''}
            transition-all duration-500 ease-in-out
            shadow-lg
          `}
        >
          {appearance.eyes}
        </div>
        
        {/* Floating Accessory */}
        <div 
          className={`
            absolute -top-2 -right-2 text-lg
            ${isAnimating ? 'animate-soft-pulse' : 'animate-gentle-bounce'}
          `}
        >
          {appearance.accessory}
        </div>

        {/* Pet Ears */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex space-x-3">
          <div className={`w-3 h-6 ${appearance.body} rounded-full transform -rotate-12`} />
          <div className={`w-3 h-6 ${appearance.body} rounded-full transform rotate-12`} />
        </div>

        {/* Pet Tail */}
        <div 
          className={`
            absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2
            w-8 h-3 ${appearance.body} rounded-full
            ${petState === 'happy' ? 'animate-gentle-bounce' : ''}
            transition-transform duration-300
            ${petState === 'sad' ? 'opacity-60' : ''}
          `}
        />

        {/* Paws */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <div className={`w-3 h-3 ${appearance.body} rounded-full`} />
          <div className={`w-3 h-3 ${appearance.body} rounded-full`} />
        </div>
      </div>

      {/* Pet Status Messages */}
      <div className="text-center">
        <div className="text-sm font-medium text-foreground mb-1">
          {petState === 'sad' && "Your companion is feeling low too"}
          {petState === 'neutral' && "Your companion is here with you"}
          {petState === 'happy' && "Your companion is thriving!"}
        </div>
        
        {/* Mood-based encouragement */}
        <div className="text-xs text-muted-foreground max-w-xs">
          {petState === 'sad' && "Take it one day at a time. Small steps matter."}
          {petState === 'neutral' && "Steady progress is still progress. You're doing okay."}
          {petState === 'happy' && "Your positive energy is showing! Keep it up!"}
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="flex space-x-2 mt-4">
        <button 
          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs hover:bg-primary/20 transition-colors"
          onClick={() => {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);
          }}
        >
          Pat 🤚
        </button>
        <button className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-xs hover:bg-secondary/30 transition-colors">
          Feed 🍃
        </button>
      </div>
    </div>
  );
};