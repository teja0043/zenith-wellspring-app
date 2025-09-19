import { useState } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AssessmentResult {
  id: string;
  type: 'phq' | 'gad';
  score: number;
  severity: string;
  answers: number[];
  dateUTC: string;
}

export const useAssessments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const { toast } = useToast();

  const getSeverityLevel = (score: number, type: 'phq' | 'gad') => {
    if (type === 'phq') {
      if (score <= 4) return 'Minimal';
      if (score <= 9) return 'Mild';
      if (score <= 14) return 'Moderate';
      if (score <= 19) return 'Moderately Severe';
      return 'Severe';
    } else {
      if (score <= 4) return 'Minimal';
      if (score <= 9) return 'Mild';
      if (score <= 14) return 'Moderate';
      return 'Severe';
    }
  };

  const submitPHQ = async (answers: number[]) => {
    try {
      setIsLoading(true);
      const score = answers.reduce((sum, answer) => sum + answer, 0);
      const severity = getSeverityLevel(score, 'phq');
      
      const response: any = await apiService.submitPHQ(answers);
      
      const result: AssessmentResult = {
        id: response.id || Date.now().toString(),
        type: 'phq',
        score,
        severity,
        answers,
        dateUTC: new Date().toISOString()
      };
      
      setHistory(prev => [result, ...prev]);
      
      toast({
        title: "PHQ-9 Assessment Complete",
        description: `Score: ${score}/27 (${severity})`,
      });
      
      return result;
    } catch (error: any) {
      // Mock response for development
      const score = answers.reduce((sum, answer) => sum + answer, 0);
      const severity = getSeverityLevel(score, 'phq');
      
      const result: AssessmentResult = {
        id: Date.now().toString(),
        type: 'phq',
        score,
        severity,
        answers,
        dateUTC: new Date().toISOString()
      };
      
      setHistory(prev => [result, ...prev]);
      
      toast({
        title: "PHQ-9 Assessment Complete",
        description: `Score: ${score}/27 (${severity})`,
      });
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const submitGAD = async (answers: number[]) => {
    try {
      setIsLoading(true);
      const score = answers.reduce((sum, answer) => sum + answer, 0);
      const severity = getSeverityLevel(score, 'gad');
      
      const response: any = await apiService.submitGAD(answers);
      
      const result: AssessmentResult = {
        id: response.id || Date.now().toString(),
        type: 'gad',
        score,
        severity,
        answers,
        dateUTC: new Date().toISOString()
      };
      
      setHistory(prev => [result, ...prev]);
      
      toast({
        title: "GAD-7 Assessment Complete",
        description: `Score: ${score}/21 (${severity})`,
      });
      
      return result;
    } catch (error: any) {
      // Mock response for development
      const score = answers.reduce((sum, answer) => sum + answer, 0);
      const severity = getSeverityLevel(score, 'gad');
      
      const result: AssessmentResult = {
        id: Date.now().toString(),
        type: 'gad',
        score,
        severity,
        answers,
        dateUTC: new Date().toISOString()
      };
      
      setHistory(prev => [result, ...prev]);
      
      toast({
        title: "GAD-7 Assessment Complete",
        description: `Score: ${score}/21 (${severity})`,
      });
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response: any = await apiService.getAssessmentHistory();
      setHistory(response.assessments);
    } catch (error) {
      // Mock data for development
      const mockHistory: AssessmentResult[] = [
        {
          id: '1',
          type: 'phq',
          score: 8,
          severity: 'Mild',
          answers: [1, 1, 2, 1, 0, 1, 1, 1, 0],
          dateUTC: new Date().toISOString()
        },
        {
          id: '2',
          type: 'gad',
          score: 6,
          severity: 'Mild',
          answers: [1, 1, 1, 1, 1, 1, 0],
          dateUTC: new Date().toISOString()
        }
      ];
      setHistory(mockHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestAssessment = (type: 'phq' | 'gad') => {
    return history.find(assessment => assessment.type === type);
  };

  return {
    isLoading,
    history,
    submitPHQ,
    submitGAD,
    loadHistory,
    getLatestAssessment,
  };
};