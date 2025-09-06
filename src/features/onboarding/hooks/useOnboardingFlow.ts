import { useState, useCallback } from 'react';
import { OnboardingData } from '../types/onboarding';
// Hook for managing onboarding flow state and navigation

export const useOnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const updateOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const resetFlow = useCallback(() => {
    setCurrentStep(0);
    setOnboardingData({});
  }, []);

  return {
    currentStep,
    onboardingData,
    updateOnboardingData,
    nextStep,
    previousStep,
    goToStep,
    resetFlow,
  };
};
