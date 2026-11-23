import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import { Pet } from '../types';

interface PetCardProps {
  pet: Pet;
  isFavourite: boolean;
  onToggleFavourite: (petId: string) => void;
  onViewDetails: (pet: Pet) => void;
}

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  isFavourite,
  onToggleFavourite,
  onViewDetails,
}) => {
  const statusLabel =
    pet.status === 'AVAILABLE'
      ? 'Available'
      : pet.status === 'PENDING'
      ? 'Under Review'
      : 'Adopted';

  const statusBadgeBg =
    pet.status === 'AVAILABLE'
      ? 'bg-[#EAE0FF]'
      : pet.status === 'PENDING'
      ? 'bg-[#F4EEFF]'
      : 'bg-[#FFFFFF] border border-[#DCD1F5]';

  return (
    <article className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-shadow flex flex-col">
      {/* Consistent 4:3 Image Frame */}
      <div className="relative aspect-[4/3] bg-[#EAE0FF] overflow-hidden">
        <img
          src={pet.primary_image_url}
          alt={`${pet.name} (${pet.breed})`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          onClick={() => onToggleFavourite(pet.id)}
          aria-label={isFavourite ? `Remove ${pet.name} from favourites` : `Save ${pet.name} to favourites`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#DCD1F5] flex items-center justify-center text-[#000000] hover:bg-[#EAE0FF] transition-colors cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isFavourite ? 'fill-[#8E6CE0] text-[#000000]' : 'text-[#000000]'}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-[#000000]">{pet.name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded text-[#000000] ${statusBadgeBg}`}>
              {statusLabel}
            </span>
          </div>

          <p className="text-sm text-[#000000] mt-1">
            {pet.breed} · {pet.age_label}
          </p>

          <p className="text-xs text-[#000000] mt-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#000000] shrink-0" />
            <span>{pet.location}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(pet)}
          className="w-full py-2.5 px-4 rounded-lg bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] text-sm font-medium transition-colors cursor-pointer"
        >
          View Details
        </button>
      </div>
    </article>
  );
};
