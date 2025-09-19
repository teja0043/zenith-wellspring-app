import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface QuickMoodCheckProps {
  currentMood: number;
  onMoodChange: (mood: number) => void;
}

const moodOptions = [
  { value: 1, emoji: "😢", label: "Very Low", color: "bg-mood-sad" },
  { value: 2, emoji: "😔", label: "Low", color: "bg-mood-sad" },
  { value: 3, emoji: "😐", label: "Okay", color: "bg-mood-neutral" },
  { value: 4, emoji: "🙂", label: "Fair", color: "bg-mood-neutral" },
  { value: 5, emoji: "😊", label: "Good", color: "bg-mood-happy" },
  { value: 6, emoji: "😄", label: "Great", color: "bg-mood-happy" },
  { value: 7, emoji: "🤗", label: "Amazing", color: "bg-mood-happy" }
];

export const QuickMoodCheck = ({ currentMood, onMoodChange }: QuickMoodCheckProps) => {
  const [selectedMood, setSelectedMood] = useState(currentMood);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onMoodChange(selectedMood);
    setNote("");
    setIsSubmitting(false);
    
    // Show success message (would integrate with toast system)
    console.log("Mood updated:", { mood: selectedMood, note, timestamp: new Date() });
  };

  return (
    <div className="space-y-4">
      {/* Mood Scale */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">How are you feeling?</label>
        <div className="grid grid-cols-7 gap-1">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedMood(option.value)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all duration-200
                ${selectedMood === option.value 
                  ? `${option.color} text-white shadow-md scale-105` 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }
              `}
            >
              <span className="text-lg mb-1">{option.emoji}</span>
              <span className="text-xs font-medium">{option.value}</span>
            </button>
          ))}
        </div>
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {moodOptions.find(m => m.value === selectedMood)?.label}
          </span>
        </div>
      </div>

      {/* Optional Note */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          What's on your mind? (Optional)
        </label>
        <Textarea
          placeholder="Any thoughts about how you're feeling today..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[80px] resize-none"
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground text-right">
          {note.length}/500
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full gradient-primary text-white"
      >
        {isSubmitting ? "Saving..." : "Update Mood"}
      </Button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          View Mood History
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          Mood Insights
        </Button>
      </div>
    </div>
  );
};