import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Pet, QuizRecommendation } from '../types';
import { api } from '../services/api';
import { PetCard } from '../components/PetCard';

interface QuizPageProps {
  favouriteIds: string[];
  onToggleFavourite: (petId: string) => void;
  onViewPet: (pet: Pet) => void;
  onShowToast: (msg: string) => void;
}

const QUESTIONS = [
  {
    key: 'preferredSpecies',
    question: 'Which kind of pet are you interested in adopting?',
    options: ['Any', 'Dog', 'Cat', 'Rabbit', 'Bird'],
  },
  {
    key: 'livingSpace',
    question: 'What best describes your home environment?',
    options: ['Apartment', 'House with Yard', 'Independent House', 'Spacious Villa'],
  },
  {
    key: 'dailyAvailability',
    question: 'How much time can you spend with your pet each day?',
    options: ['1-2 hours', '2-4 hours', '4+ hours', 'Work from home'],
  },
  {
    key: 'activityLevel',
    question: 'What activity level matches your daily lifestyle?',
    options: ['Low', 'Moderate', 'High'],
  },
  {
    key: 'petExperience',
    question: 'What is your previous experience caring for pets?',
    options: ['First-time', 'Some Experience', 'Experienced'],
  },
  {
    key: 'preferredAge',
    question: 'Do you prefer a particular age stage?',
    options: ['Any', 'Young', 'Adult', 'Senior'],
  },
];

export const QuizPage: React.FC<QuizPageProps> = ({
  favouriteIds,
  onToggleFavourite,
  onViewPet,
  onShowToast,
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    preferredSpecies: 'Any',
    livingSpace: 'Apartment',
    dailyAvailability: '2-4 hours',
    activityLevel: 'Moderate',
    petExperience: 'First-time',
    preferredAge: 'Any',
  });
  const [results, setResults] = useState<QuizRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const progressPercent = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      const response = await api.submitQuiz(answers);
      setResults(response.recommendations || []);
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#000000]">Your Recommended Matches</h1>
            <p className="text-sm text-[#000000] mt-1">
              Ranked by compatibility with your home, schedule, and experience.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setResults(null);
              setStep(0);
            }}
            className="px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD1F5] hover:bg-[#EAE0FF] text-[#000000] text-sm font-medium cursor-pointer self-start sm:self-auto"
          >
            Retake Quiz
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <div key={item.pet.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EAE0FF] text-[#000000] tabular-nums">
                  {item.matchScore}% Match
                </span>
                <span className="text-xs text-[#000000] truncate max-w-[65%]">
                  {item.matchReasons[0] || 'Good lifestyle fit'}
                </span>
              </div>
              <PetCard
                pet={item.pet}
                isFavourite={favouriteIds.includes(item.pet.id)}
                onToggleFavourite={onToggleFavourite}
                onViewDetails={onViewPet}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <p className="text-xs font-medium text-[#000000]">
          Question {step + 1} of {QUESTIONS.length}
        </p>
        <h1 className="text-3xl font-semibold text-[#000000] mt-1">Match Finder Quiz</h1>
        <div className="w-full h-2 bg-[#FFFFFF] border border-[#DCD1F5] rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#B99EF5] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <h2 className="text-xl font-medium text-[#000000] mb-5">{currentQuestion.question}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.key] === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.key]: option }))
                }
                className={`p-4 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition-colors cursor-pointer text-[#000000] ${
                  isSelected
                    ? 'bg-[#EAE0FF] border-[#8E6CE0] font-semibold'
                    : 'bg-[#F4EEFF] border-[#DCD1F5] hover:border-[#8E6CE0]'
                }`}
              >
                <span>{option}</span>
                {isSelected && <Check className="w-4 h-4 text-[#000000]" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#DCD1F5]">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#DCD1F5] bg-[#FFFFFF] text-sm font-medium text-[#000000] disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < QUESTIONS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitQuiz}
              className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              {loading ? 'Finding Matches...' : 'See My Matches'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
