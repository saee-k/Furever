import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface ListPetPageProps {
  user: User | null;
  onOpenAuth: () => void;
  onPetCreated: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const ListPetPage: React.FC<ListPetPageProps> = ({
  user,
  onOpenAuth,
  onPetCreated,
  onShowToast,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!formData.get('vaccinated')) formData.set('vaccinated', 'false');
    if (!formData.get('spayedNeutered')) formData.set('spayedNeutered', 'false');
    if (!formData.get('microchipped')) formData.set('microchipped', 'false');

    setSubmitting(true);
    try {
      await api.createPet(formData);
      onShowToast('Pet listing published successfully!');
      await onPetCreated();
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#000000]">List a Pet for Adoption</h1>
        <p className="text-sm text-[#000000] mt-1">
          Registered users and verified shelters can publish pet profiles with photos and medical details.
        </p>
      </div>

      {!user ? (
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-8 text-center space-y-4">
          <p className="text-sm text-[#000000]">
            Please sign in to your FurEver account before publishing a pet for adoption.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-6 sm:p-8 space-y-5 text-[#000000]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Pet Name *</label>
              <input
                name="name"
                required
                placeholder="e.g. Milo"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Species *</label>
              <select
                name="species"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Breed *</label>
              <input
                name="breed"
                required
                placeholder="e.g. Indian Pariah / Indie"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Age *</label>
              <input
                name="ageLabel"
                required
                placeholder="e.g. 1.5 years"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Age Stage</label>
              <select
                name="ageCategory"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="Young">Young</option>
                <option value="Adult">Adult</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Gender</label>
              <select
                name="gender"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Weight</label>
              <input
                name="weight"
                defaultValue="12 kg"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Activity Level</label>
              <select
                name="activityLevel"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Location *</label>
              <input
                name="location"
                required
                defaultValue={user.city || 'Bengaluru'}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Shelter / Owner Name
              </label>
              <input
                name="shelterName"
                defaultValue={user.full_name}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Upload Photograph
              </label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full px-3 py-1.5 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Or Choose Sample Photo
              </label>
              <select
                name="imageUrl"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="/pets/daisy.jpg">Labrador Indie Photo</option>
                <option value="/pets/speckles.jpg">Spotted Indie Photo</option>
                <option value="/pets/goldie.jpg">Golden Indie Photo</option>
                <option value="/src/assets/images/pet_mochi_cat_1795017786328.jpg">
                  Tabby Cat Photo
                </option>
                <option value="/src/assets/images/pet_clover_bunny_1795017786624.jpg">
                  Holland Lop Bunny Photo
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#000000] mb-1">
              Health &amp; Vaccination Notes *
            </label>
            <input
              name="healthNotes"
              required
              defaultValue="Fully vaccinated, dewormed, and cleared by vet."
              className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
            />
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-[#000000]">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="vaccinated" defaultChecked value="true" />
              <span>Vaccinated</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="spayedNeutered" defaultChecked value="true" />
              <span>Spayed / Neutered</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="microchipped" value="true" />
              <span>Microchipped</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#000000] mb-1">
              Description &amp; Temperament *
            </label>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Share personality, favorite habits, and ideal home environment..."
              className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              {submitting ? 'Publishing...' : 'Publish Pet Listing'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
