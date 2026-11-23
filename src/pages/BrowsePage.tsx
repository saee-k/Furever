import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { PageTab, Pet } from '../types';
import { PetCard } from '../components/PetCard';

interface BrowsePageProps {
  pets: Pet[];
  favouriteIds: string[];
  onToggleFavourite: (petId: string) => void;
  onViewPet: (pet: Pet) => void;
  onNavigate: (tab: PageTab) => void;
}

export const BrowsePage: React.FC<BrowsePageProps> = ({
  pets,
  favouriteIds,
  onToggleFavourite,
  onViewPet,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('All');
  const [ageCategory, setAgeCategory] = useState('All');
  const [gender, setGender] = useState('All');
  const [location, setLocation] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const speciesOptions = ['All', 'Dog', 'Cat', 'Rabbit', 'Bird', 'Other'];

  const filteredPets = pets
    .filter((pet) => {
      if (species !== 'All' && pet.species !== species) return false;
      if (ageCategory !== 'All' && pet.age_category !== ageCategory) return false;
      if (gender !== 'All' && pet.gender !== gender) return false;
      if (location !== 'All' && !pet.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const text = `${pet.name} ${pet.breed} ${pet.species} ${pet.location} ${pet.description} ${pet.personality_json.join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return (b.is_featured || 0) - (a.is_featured || 0);
    });

  const resetFilters = () => {
    setSearch('');
    setSpecies('All');
    setAgeCategory('All');
    setGender('All');
    setLocation('All');
    setSortBy('featured');
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#000000]">Browse Pets</h1>
          <p className="text-sm text-[#000000] mt-1">
            Filter by species, age, gender, or neighbourhood to find your match.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('list-pet')}
          className="px-4 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          List a Pet
        </button>
      </div>

      {/* Species Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {speciesOptions.map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => setSpecies(sp)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              species === sp
                ? 'bg-[#D5C2FA] text-[#000000] border-[#B99EF5] font-semibold'
                : 'bg-[#FFFFFF] text-[#000000] border-[#DCD1F5] hover:bg-[#EAE0FF]'
            }`}
          >
            {sp === 'All' ? 'All Pets' : sp === 'Other' ? 'Small Pets' : `${sp}s`}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-4 sm:p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-[#000000] mb-1">
            Search name, breed, or trait
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Pug, Indie, calm..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55 focus:outline-none focus:border-[#8E6CE0]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#000000] mb-1">Age Group</label>
          <select
            value={ageCategory}
            onChange={(e) => setAgeCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] focus:outline-none focus:border-[#8E6CE0]"
          >
            <option value="All">All Ages</option>
            <option value="Young">Young</option>
            <option value="Adult">Adult</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#000000] mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] focus:outline-none focus:border-[#8E6CE0]"
          >
            <option value="All">Any Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#000000] mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] focus:outline-none focus:border-[#8E6CE0]"
          >
            <option value="All">All Areas</option>
            <option value="Indiranagar">Indiranagar</option>
            <option value="Koramangala">Koramangala</option>
            <option value="Whitefield">Whitefield</option>
            <option value="HSR Layout">HSR Layout</option>
            <option value="Jayanagar">Jayanagar</option>
            <option value="Bengaluru">All Bengaluru</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#000000] mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] focus:outline-none focus:border-[#8E6CE0]"
          >
            <option value="featured">Featured First</option>
            <option value="name">Name (A–Z)</option>
            <option value="oldest">Oldest Listed</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-[#000000] mb-6">
        <span>
          Showing <strong className="text-[#000000] tabular-nums">{filteredPets.length}</strong>{' '}
          companion{filteredPets.length === 1 ? '' : 's'}
        </span>
        {(species !== 'All' || search || ageCategory !== 'All' || gender !== 'All' || location !== 'All') && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-[#000000] underline cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {filteredPets.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-[#000000]">No matching pets found</h3>
          <p className="text-sm text-[#000000] mt-1 mb-4">
            Try adjusting your search or clearing one of the filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
          >
            Show All Pets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              isFavourite={favouriteIds.includes(pet.id)}
              onToggleFavourite={onToggleFavourite}
              onViewDetails={onViewPet}
            />
          ))}
        </div>
      )}
    </section>
  );
};
