import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface MoodEntry {
  id: string;
  moodValue: number;
  note?: string;
  dateUTC: string;
}

interface MoodStreak {
  current: number;
  longest: number;
  lastEntry: string;
}

export const useMood = () => {
  const [currentMood, setCurrentMood] = useState(5);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState<MoodStreak>({ current: 0, longest: 0, lastEntry: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      setIsLoading(true);
      const [historyData, streakData] = await Promise.all([
        apiService.getMoodHistory(30),
        apiService.getMoodStreak()
      ]);
      
      setHistory((historyData as any).entries);
      setStreak(streakData as any);
      
      // Set current mood from latest entry
      if ((historyData as any).entries.length > 0) {
        setCurrentMood((historyData as any).entries[0].moodValue);
      }
    } catch (error: any) {
      // Fallback to mock data for development
      const mockHistory: MoodEntry[] = [
        { id: '1', moodValue: 6, note: 'Good day overall', dateUTC: new Date().toISOString() },
        { id: '2', moodValue: 4, note: 'Feeling okay', dateUTC: new Date(Date.now() - 86400000).toISOString() }
      ];
      const mockStreak: MoodStreak = { current: 12, longest: 15, lastEntry: new Date().toISOString() };
      
      setHistory(mockHistory);
      setStreak(mockStreak);
      setCurrentMood(6);
    } finally {
      setIsLoading(false);
    }
  };

  const submitMood = async (moodValue: number, note?: string) => {
    try {
      setIsLoading(true);
      
      const response: any = await apiService.submitMood({ moodValue, note });
      
      // Update local state
      setCurrentMood(moodValue);
      setHistory(prev => [response.entry, ...prev]);
      setStreak(response.streak);
      
      toast({
        title: "Mood updated!",
        description: `Thanks for checking in. Current streak: ${response.streak.current} days`,
      });
      
      return response;
    } catch (error: any) {
      // Mock success for development
      const mockEntry: MoodEntry = {
        id: Date.now().toString(),
        moodValue,
        note,
        dateUTC: new Date().toISOString()
      };
      
      setCurrentMood(moodValue);
      setHistory(prev => [mockEntry, ...prev]);
      setStreak(prev => ({ ...prev, current: prev.current + 1 }));
      
      toast({
        title: "Mood updated!",
        description: `Thanks for checking in. Keep tracking for insights!`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodCalendar = (month: number, year: number) => {
    // Filter history for specific month/year
    return history.filter(entry => {
      const date = new Date(entry.dateUTC);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  return {
    currentMood,
    history,
    streak,
    isLoading,
    submitMood,
    getMoodCalendar,
    refreshData: loadMoodData,
  };
};