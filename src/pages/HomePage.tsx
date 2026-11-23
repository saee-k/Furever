import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { PageTab, Pet, PublicStats } from '../types';
import { PetCard } from '../components/PetCard';

interface HomePageProps {
  pets: Pet[];
  favouriteIds: string[];
  stats: PublicStats | null;
  onNavigate: (tab: PageTab) => void;
  onToggleFavourite: (petId: string) => void;
  onViewPet: (pet: Pet) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  pets,
  favouriteIds,
  stats,
  onNavigate,
  onToggleFavourite,
  onViewPet,
}) => {
  const availablePets = pets.filter((pet) => pet.status === 'AVAILABLE');
  const heroPet = pets.find((pet) => pet.id === 'pet-bobi') || availablePets[0] || pets[0];
  const featuredPets = pets.slice(0, 6);

  const steps: Array<{
    num: string;
    title: string;
    description: string;
    actionLabel: string;
    targetTab: PageTab;
  }> = [
    {
      num: '01',
      title: 'Discover',
      description:
        'Search pets by species, breed, age, and neighbourhood, or use our swipe deck and lifestyle quiz.',
      actionLabel: 'Browse Pets',
      targetTab: 'browse',
    },
    {
      num: '02',
      title: 'Meet & Evaluate',
      description:
        'Review full medical records, vaccination status, temperament traits, and home compatibility notes.',
      actionLabel: 'Take Match Quiz',
      targetTab: 'quiz',
    },
    {
      num: '03',
      title: 'Apply to Adopt',
      description:
        'Submit an adoption inquiry with instant eligibility verification and live application status updates.',
      actionLabel: 'Track Applications',
      targetTab: 'status',
    },
    {
      num: '04',
      title: 'List a Pet',
      description:
        'Shelters and pet owners can publish verified profiles with photos and health history for safe rehoming.',
      actionLabel: 'List a Pet',
      targetTab: 'list-pet',
    },
  ];

  return (
    <div>
      {/* 1. HERO SECTION (Clean white card + light purple page background, black text) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Featured Pet Photograph */}
          <div className="lg:col-span-5">
            {heroPet && (
              <div
                onClick={() => onViewPet(heroPet)}
                className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.06)] cursor-pointer max-w-md mx-auto lg:mx-0"
              >
                <div className="aspect-[4/3] sm:aspect-[4/4] bg-[#EAE0FF] overflow-hidden">
                  <img
                    src={heroPet.primary_image_url}
                    alt={`${heroPet.name} — ${heroPet.breed}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#000000]">{heroPet.name}</h2>
                    <p className="text-sm text-[#000000]">
                      {heroPet.breed} · {heroPet.age_label}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-md bg-[#EAE0FF] text-[#000000] whitespace-nowrap">
                    {heroPet.status === 'AVAILABLE' ? 'Available' : 'Under Review'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Main Heading, Supporting Copy, Two Primary Actions */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-sm font-medium text-[#000000]">
              Ethical Pet Adoption &amp; Matching · {availablePets.length} Companions Available
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#000000] leading-tight max-w-xl">
              Find Your Perfect Companion
            </h1>

            <p className="text-base text-[#000000] max-w-xl leading-relaxed">
              FurEver brings local animal shelters, foster caregivers, and caring adopters together on one calm, transparent platform. Explore health-checked pets, match by lifestyle, and track every step of your adoption journey.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('browse')}
                className="px-6 py-3 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium transition-colors cursor-pointer"
              >
                Browse Pets
              </button>
              <button
                type="button"
                onClick={() => onNavigate('quiz')}
                className="px-6 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE0FF] text-[#000000] border border-[#DCD1F5] text-sm font-medium transition-colors cursor-pointer"
              >
                Find Your Match
              </button>
            </div>

            <div className="pt-4 border-t border-[#DCD1F5] flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#000000]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#000000]" />
                Health Checked
              </span>
              <span>100% Ethical Shelters</span>
              <span>Live Application Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PETS SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
              Pets Waiting for a Home
            </h2>
            <p className="text-sm text-[#000000] mt-1">
              Meet verified dogs, cats, rabbits, and birds looking for loving families.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#000000] hover:underline cursor-pointer self-start sm:self-auto"
          >
            <span>View all pets</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              isFavourite={favouriteIds.includes(pet.id)}
              onToggleFavourite={onToggleFavourite}
              onViewDetails={onViewPet}
            />
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION (White band alternating with light purple page background) */}
      <section className="bg-[#FFFFFF] border-y border-[#DCD1F5] py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">How It Works</h2>
            <p className="text-sm sm:text-base text-[#000000] mt-2">
              A straightforward four-step process designed for both first-time adopters and shelter caregivers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-[#F4EEFF] border border-[#DCD1F5] rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <span className="text-xs font-semibold text-[#000000] tracking-wide">
                    Step {step.num}
                  </span>
                  <h3 className="text-lg font-semibold text-[#000000] mt-1.5">{step.title}</h3>
                  <p className="text-sm text-[#000000] mt-2 leading-relaxed">{step.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(step.targetTab)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#000000] hover:underline cursor-pointer self-start"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ADOPTION INFORMATION & STATISTICS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
              Thoughtful Adoption, Verified Care
            </h2>
            <p className="text-sm sm:text-base text-[#000000] leading-relaxed">
              Every companion listed on FurEver undergoes basic health screening, age-appropriate vaccinations, and deworming before meeting potential adopters. Our eligibility check helps match each pet with a comfortable, prepared home.
            </p>
            <p className="text-sm text-[#000000] leading-relaxed">
              Need post-adoption care or urgent guidance? Browse our directory of verified local veterinary clinics or report a missing companion on the community Lost &amp; Found board.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-[#000000] tabular-nums">
                {(stats?.availablePets || availablePets.length) + 142}+
              </div>
              <p className="text-sm text-[#000000] mt-1">Successful Adoptions</p>
            </div>
            <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-[#000000] tabular-nums">
                {stats?.availablePets ?? availablePets.length}
              </div>
              <p className="text-sm text-[#000000] mt-1">Pets Waiting Today</p>
            </div>
            <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-[#000000] tabular-nums">
                {stats?.totalVets ?? 4}
              </div>
              <p className="text-sm text-[#000000] mt-1">Partner Vet Clinics</p>
            </div>
            <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-[#000000] tabular-nums">
                100%
              </div>
              <p className="text-sm text-[#000000] mt-1">Medical Records Listed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
            Stories from Adopters &amp; Shelters
          </h2>
          <p className="text-sm text-[#000000] mt-1">
            Real experiences from families and local rescue teams using FurEver.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <blockquote className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-6 flex flex-col justify-between gap-4">
            <p className="text-sm text-[#000000] leading-relaxed">
              "The Match Quiz suggested Goldie based on our apartment routine and quiet home. Viewing her vaccination notes and tracking our application step by step made the process calm and reassuring."
            </p>
            <footer className="pt-3 border-t border-[#DCD1F5]">
              <p className="text-sm font-medium text-[#000000]">Ananya Rao</p>
              <p className="text-xs text-[#000000]">Adopted Goldie · Indiranagar</p>
            </footer>
          </blockquote>

          <blockquote className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-6 flex flex-col justify-between gap-4">
            <p className="text-sm text-[#000000] leading-relaxed">
              "Managing incoming adoption inquiries and reviewing housing suitability in one dashboard saved our volunteer shelter team hours every week."
            </p>
            <footer className="pt-3 border-t border-[#DCD1F5]">
              <p className="text-sm font-medium text-[#000000]">Priya Menon</p>
              <p className="text-xs text-[#000000]">Rescue Coordinator · CARE Bengaluru</p>
            </footer>
          </blockquote>

          <blockquote className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-6 flex flex-col justify-between gap-4">
            <p className="text-sm text-[#000000] leading-relaxed">
              "When our rabbit wandered into a neighbour's garden, the Lost &amp; Found board helped us connect and bring him home safely the same afternoon."
            </p>
            <footer className="pt-3 border-t border-[#DCD1F5]">
              <p className="text-sm font-medium text-[#000000]">Kavya Shetty</p>
              <p className="text-xs text-[#000000]">Community Member · Jayanagar</p>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl font-semibold text-[#000000]">
              Ready to welcome a new friend?
            </h2>
            <p className="text-sm text-[#000000]">
              Explore available companions, try the interactive swipe deck, or check nearby veterinary clinics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('swipe')}
              className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium transition-colors cursor-pointer"
            >
              Try Swipe Match
            </button>
            <button
              type="button"
              onClick={() => onNavigate('vets')}
              className="px-5 py-2.5 rounded-lg bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] border border-[#DCD1F5] text-sm font-medium transition-colors cursor-pointer"
            >
              Find a Vet
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
