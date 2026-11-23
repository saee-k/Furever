import React, { useState } from 'react';
import { Heart, MapPin, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { Pet } from '../types';

interface SwipePageProps {
  pets: Pet[];
  favouriteIds: string[];
  onSwipeAction: (petId: string, action: 'like' | 'pass') => void;
  onViewPet: (pet: Pet) => void;
  onOpenSaved: () => void;
}

export const SwipePage: React.FC<SwipePageProps> = ({
  pets,
  favouriteIds,
  onSwipeAction,
  onViewPet,
  onOpenSaved,
}) => {
  const [speciesPref, setSpeciesPref] = useState('All');
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);

  const deck = pets.filter(
    (pet) =>
      pet.status === 'AVAILABLE' &&
      (speciesPref === 'All' || pet.species === speciesPref) &&
      !swipedIds.includes(pet.id)
  );

  const currentPet = deck[0];

  const handleAction = (action: 'like' | 'pass') => {
    if (!currentPet) return;
    setSwipedIds((prev) => [...prev, currentPet.id]);
    setUndoStack((prev) => [...prev, currentPet.id]);
    onSwipeAction(currentPet.id, action);
  };

  const handleUndo = () => {
    const lastId = undoStack[undoStack.length - 1];
    if (!lastId) return;
    setUndoStack((prev) => prev.slice(0, -1));
    setSwipedIds((prev) => prev.filter((id) => id !== lastId));
  };

  const handleReset = () => {
    setSwipedIds([]);
    setUndoStack([]);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h1 className="text-3xl font-semibold text-[#000000]">Swipe Match</h1>
        <p className="text-sm text-[#000000] mt-1">
          View one companion at a time. Like pets to save them to your matches, or pass to see the next pet.
        </p>
      </div>

      {/* Matching Preferences */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {['All', 'Dog', 'Cat', 'Rabbit', 'Bird'].map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => setSpeciesPref(sp)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              speciesPref === sp
                ? 'bg-[#D5C2FA] text-[#000000] border-[#B99EF5] font-semibold'
                : 'bg-[#FFFFFF] text-[#000000] border-[#DCD1F5] hover:bg-[#EAE0FF]'
            }`}
          >
            {sp === 'All' ? 'All Species' : `${sp}s`}
          </button>
        ))}

        <button
          type="button"
          onClick={onOpenSaved}
          className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[#EAE0FF] text-[#000000] border border-[#DCD1F5] hover:bg-[#D5C2FA] transition-colors cursor-pointer"
        >
          Saved Matches ({favouriteIds.length})
        </button>
      </div>

      {/* Single Pet Card Stage */}
      <div className="max-w-md mx-auto">
        {currentPet ? (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl overflow-hidden shadow-[0_6px_22px_rgba(0,0,0,0.06)]">
              <div className="aspect-[4/3] bg-[#EAE0FF] overflow-hidden">
                <img
                  src={currentPet.primary_image_url}
                  alt={currentPet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-2xl font-semibold text-[#000000]">{currentPet.name}</h2>
                  <span className="text-xs font-medium text-[#000000]">
                    {currentPet.gender} · {currentPet.age_label}
                  </span>
                </div>

                <p className="text-sm text-[#000000]">
                  {currentPet.breed} · {currentPet.personality_json.slice(0, 3).join(', ')}
                </p>

                <p className="text-xs text-[#000000] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#000000]" />
                  <span>{currentPet.location}</span>
                </p>

                <p className="text-sm text-[#000000] leading-relaxed pt-1">
                  {currentPet.description}
                </p>

                <div className="pt-3 border-t border-[#DCD1F5] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#000000]">
                    <ShieldCheck className="w-4 h-4" />
                    Health Verified
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewPet(currentPet)}
                    className="text-sm font-medium text-[#000000] underline cursor-pointer"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Like / Undo / Pass Controls */}
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => handleAction('pass')}
                aria-label="Pass pet"
                className="w-14 h-14 rounded-full bg-[#FFFFFF] border border-[#DCD1F5] shadow-sm flex items-center justify-center text-[#000000] hover:bg-[#EAE0FF] transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                aria-label="Undo last swipe"
                className="w-11 h-11 rounded-full bg-[#EAE0FF] border border-[#DCD1F5] flex items-center justify-center text-[#000000] disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleAction('like')}
                aria-label="Like and save pet"
                className="w-14 h-14 rounded-full bg-[#D5C2FA] hover:bg-[#C4AEF7] border border-[#B99EF5] text-[#000000] shadow-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                <Heart className="w-6 h-6 fill-[#8E6CE0] text-[#000000]" />
              </button>
            </div>

            <p className="text-center text-xs text-[#000000]">
              {deck.length} companion{deck.length === 1 ? '' : 's'} remaining
            </p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-8 text-center space-y-4">
            <h2 className="text-xl font-semibold text-[#000000]">You have viewed all pets in this deck</h2>
            <p className="text-sm text-[#000000]">
              You currently have {favouriteIds.length} saved match{favouriteIds.length === 1 ? '' : 'es'}.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={onOpenSaved}
                className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
              >
                View Saved Matches
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-lg bg-[#EAE0FF] text-[#000000] text-sm font-medium cursor-pointer"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
