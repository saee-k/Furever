import React, { useEffect, useState } from 'react';
import { CheckCircle2, Heart, Mail, MapPin, ShieldCheck, X } from 'lucide-react';
import { Pet, User } from '../types';
import { api, setAuthToken } from '../services/api';

interface PetDetailsModalProps {
  pet: Pet;
  isFavourite: boolean;
  onClose: () => void;
  onToggleFavourite: (petId: string) => void;
  onOpenApply: (pet: Pet) => void;
}

export const PetDetailsModal: React.FC<PetDetailsModalProps> = ({
  pet,
  isFavourite,
  onClose,
  onToggleFavourite,
  onOpenApply,
}) => {
  const images =
    pet.images && pet.images.length > 0
      ? pet.images
      : [{ id: 'main', pet_id: pet.id, image_url: pet.primary_image_url, caption: pet.name, is_primary: 1, sort_order: 1 }];

  const [activePhoto, setActivePhoto] = useState(images[0].image_url);

  useEffect(() => {
    setActivePhoto(images[0].image_url);
  }, [pet.id]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000]/45 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-6 sm:p-8 shadow-xl text-[#000000]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pet details"
          className="absolute top-4 right-4 p-2 rounded-lg border border-[#DCD1F5] text-[#000000] hover:bg-[#EAE0FF] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images & Health Summary */}
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#EAE0FF] border border-[#DCD1F5]">
              <img
                src={activePhoto}
                alt={pet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActivePhoto(img.image_url)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      activePhoto === img.image_url ? 'border-[#8E6CE0]' : 'border-[#DCD1F5]'
                    }`}
                  >
                    <img src={img.image_url} alt={img.caption} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-[#F4EEFF] border border-[#DCD1F5] rounded-xl p-4 space-y-2 text-xs text-[#000000]">
              <p className="font-semibold text-[#000000] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#000000]" />
                Health &amp; Vaccination Record
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[#000000]">
                <span>{pet.vaccinated ? '✓ Vaccinated' : '• Pending vaccine'}</span>
                <span>{pet.spayed_neutered ? '✓ Spayed / Neutered' : '• Not spayed'}</span>
                <span>{pet.microchipped ? '✓ Microchipped' : '• No microchip'}</span>
                <span>Fee: {pet.adoption_fee}</span>
              </div>
              <p className="text-[#000000] pt-1">{pet.health_notes}</p>
            </div>
          </div>

          {/* Pet Info */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#EAE0FF] text-[#000000]">
                {pet.status}
              </span>
              <h2 className="text-2xl font-semibold text-[#000000] mt-2">{pet.name}</h2>
              <p className="text-sm text-[#000000]">
                {pet.breed} · {pet.species} · {pet.gender} · {pet.age_label} · {pet.weight}
              </p>
              <p className="text-xs text-[#000000] mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#000000]" />
                <span>
                  {pet.location} ({pet.shelter_name})
                </span>
              </p>
            </div>

            <p className="text-sm text-[#000000] leading-relaxed">{pet.description}</p>

            <div className="text-sm space-y-2 text-[#000000]">
              <p>
                <strong>Personality:</strong> <span>{pet.personality_json.join(', ')}</span>
              </p>
              <p>
                <strong>Good with:</strong> <span>{pet.good_with_json.join(', ')}</span>
              </p>
            </div>

            <div className="bg-[#EAE0FF] border border-[#DCD1F5] rounded-xl p-3.5 text-xs text-[#000000]">
              <strong>Adoption Requirements:</strong>{' '}
              {pet.adoption_requirements || 'Loving indoor home and regular veterinary checkups.'}
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {pet.status === 'AVAILABLE' ? (
                <button
                  type="button"
                  onClick={() => onOpenApply(pet)}
                  className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
                >
                  Apply to Adopt
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2.5 rounded-lg bg-[#F4EEFF] border border-[#DCD1F5] text-[#000000] text-sm font-medium opacity-70"
                >
                  Currently {pet.status}
                </button>
              )}

              <button
                type="button"
                onClick={() => onToggleFavourite(pet.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#DCD1F5] bg-[#FFFFFF] hover:bg-[#F4EEFF] text-sm font-medium text-[#000000] cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isFavourite ? 'fill-[#8E6CE0] text-[#000000]' : 'text-[#000000]'}`} />
                <span>{isFavourite ? 'Saved' : 'Save'}</span>
              </button>

              <a
                href={`mailto:${pet.lister?.email || 'support@furever.com'}?subject=${encodeURIComponent(
                  `Adoption Inquiry for ${pet.name}`
                )}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#F4EEFF] hover:bg-[#EAE0FF] border border-[#DCD1F5] text-sm font-medium text-[#000000]"
              >
                <Mail className="w-4 h-4 text-[#000000]" />
                <span>Contact Shelter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ApplicationModalProps {
  pet: Pet;
  user: User;
  onClose: () => void;
  onSubmitted: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  pet,
  user,
  onClose,
  onSubmitted,
  onShowToast,
}) => {
  const [fitReason, setFitReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const wordCount = fitReason.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await api.submitApplication({
        petId: pet.id,
        applicantName: fd.get('applicantName'),
        applicantEmail: fd.get('applicantEmail'),
        applicantPhone: fd.get('applicantPhone'),
        city: fd.get('city'),
        housingType: fd.get('housingType'),
        hasYard: fd.get('hasYard') === '1',
        petExperience: fd.get('petExperience'),
        householdMembers: fd.get('householdMembers'),
        dailyAloneHours: fd.get('dailyAloneHours'),
        fitReason,
      });
      onShowToast(
        res.eligibility.result === 'APPLICABLE'
          ? 'Application submitted and eligibility verified!'
          : 'Application submitted for shelter review.'
      );
      await onSubmitted();
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000]/45 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-6 sm:p-8 shadow-xl text-[#000000]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application form"
          className="absolute top-4 right-4 p-2 rounded-lg border border-[#DCD1F5] text-[#000000] hover:bg-[#EAE0FF] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-2xl font-semibold text-[#000000]">Adoption Application</h2>
        <p className="text-sm text-[#000000] mt-1 mb-5">
          Applying for <strong>{pet.name}</strong> ({pet.breed} · {pet.shelter_name})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Full Name *</label>
              <input
                name="applicantName"
                required
                defaultValue={user.full_name}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Email *</label>
              <input
                type="email"
                name="applicantEmail"
                required
                defaultValue={user.email}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Phone *</label>
              <input
                name="applicantPhone"
                required
                defaultValue={user.phone}
                placeholder="+91 98xxx xxxxx"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">City *</label>
              <input
                name="city"
                required
                defaultValue={user.city || 'Bengaluru'}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Living Arrangement *
              </label>
              <select
                name="housingType"
                defaultValue={user.housing_type || 'Apartment'}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="House with Yard">House with Yard</option>
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Farm / Villa">Farm / Villa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Previous Pet Experience *
              </label>
              <select
                name="petExperience"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="Previous pet owner">Previous pet owner</option>
                <option value="Experienced owner">Experienced owner</option>
                <option value="First-time adopter">First-time adopter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Household Members
              </label>
              <input
                name="householdMembers"
                defaultValue="2 Adults"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Hours Pet Alone Daily
              </label>
              <select
                name="dailyAloneHours"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="0-2 hours">0–2 hours</option>
                <option value="2-4 hours">2–4 hours</option>
                <option value="4-6 hours">4–6 hours</option>
                <option value="6+ hours">6+ hours</option>
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-[#000000]">
            <input type="checkbox" name="hasYard" value="1" />
            <span>Home has a fenced yard or netted balcony</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-[#000000] mb-1">
              Why would your home be a good fit for {pet.name}? (Min 20 words) *
            </label>
            <textarea
              name="fitReason"
              required
              rows={4}
              value={fitReason}
              onChange={(e) => setFitReason(e.target.value)}
              placeholder="Share your daily routine, family experience, and living setup..."
              className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
            <p className="text-xs mt-1 text-[#000000] font-medium">
              {wordCount} / 20 words minimum {wordCount >= 20 ? '✓' : ''}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#DCD1F5] bg-[#FFFFFF] text-sm font-medium text-[#000000] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User, favouriteIds: string[]) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, onShowToast }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await api.login(String(fd.get('email')), String(fd.get('password')));
      setAuthToken(res.token);
      onSuccess(res.user, res.favouriteIds || []);
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (email: string) => {
    setSubmitting(true);
    try {
      const res = await api.login(email, 'furever123');
      setAuthToken(res.token);
      onSuccess(res.user, res.favouriteIds || []);
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await api.register({
        fullName: String(fd.get('fullName')),
        email: String(fd.get('email')),
        password: String(fd.get('password')),
        role: String(fd.get('role') || 'adopter'),
        city: String(fd.get('city') || 'Bengaluru'),
      });
      setAuthToken(res.token);
      onSuccess(res.user, []);
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-6 sm:p-8 shadow-xl text-[#000000]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
          className="absolute top-4 right-4 p-2 rounded-lg border border-[#DCD1F5] text-[#000000] hover:bg-[#EAE0FF] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-2xl font-semibold text-[#000000] mb-4">
          {mode === 'login' ? 'Sign In to FurEver' : 'Create Your Account'}
        </h2>

        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4EEFF] rounded-lg border border-[#DCD1F5] mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-md text-sm font-medium cursor-pointer text-[#000000] ${
              mode === 'login' ? 'bg-[#FFFFFF] shadow-sm font-semibold' : ''
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-md text-sm font-medium cursor-pointer text-[#000000] ${
              mode === 'register' ? 'bg-[#FFFFFF] shadow-sm font-semibold' : ''
            }`}
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <>
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#000000] mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#000000] mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#DCD1F5]">
              <p className="text-xs font-medium text-[#000000] mb-2.5">
                Quick Demo Accounts (Password: furever123)
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('adopter@furever.com')}
                  className="px-3 py-1.5 rounded-lg bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] text-xs font-medium cursor-pointer"
                >
                  Adopter
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('shelter@furever.com')}
                  className="px-3 py-1.5 rounded-lg bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] text-xs font-medium cursor-pointer"
                >
                  Pet Shelter
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@furever.com')}
                  className="px-3 py-1.5 rounded-lg bg-[#F4EEFF] border border-[#DCD1F5] hover:bg-[#EAE0FF] text-[#000000] text-xs font-medium cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Full Name *</label>
              <input
                name="fullName"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Password (min 6 characters) *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#000000] mb-1">Role</label>
                <select
                  name="role"
                  className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
                >
                  <option value="adopter">Adopter</option>
                  <option value="lister">Pet Shelter / Lister</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#000000] mb-1">City</label>
                <input
                  name="city"
                  defaultValue="Bengaluru"
                  className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface SavedModalProps {
  pets: Pet[];
  onClose: () => void;
  onViewPet: (pet: Pet) => void;
  onRemoveFavourite: (petId: string) => void;
  onStartSwiping: () => void;
}

export const SavedModal: React.FC<SavedModalProps> = ({
  pets,
  onClose,
  onViewPet,
  onRemoveFavourite,
  onStartSwiping,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-6 sm:p-8 shadow-xl text-[#000000]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close saved matches"
          className="absolute top-4 right-4 p-2 rounded-lg border border-[#DCD1F5] text-[#000000] hover:bg-[#EAE0FF] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-semibold text-[#000000] mb-4">
          Saved Favourites ({pets.length})
        </h2>

        {pets.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-[#000000]">You haven't saved any pets yet.</p>
            <button
              type="button"
              onClick={onStartSwiping}
              className="px-4 py-2 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              Try Swipe Match
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#DCD1F5] bg-[#F4EEFF]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={pet.primary_image_url}
                    alt={pet.name}
                    className="w-14 h-14 rounded-lg object-cover border border-[#DCD1F5]"
                  />
                  <div>
                    <p className="font-semibold text-sm text-[#000000]">{pet.name}</p>
                    <p className="text-xs text-[#000000]">
                      {pet.breed} · {pet.age_label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onViewPet(pet)}
                    className="px-3 py-1.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-xs font-medium cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFavourite(pet.id)}
                    className="px-3 py-1.5 rounded-lg border border-[#DCD1F5] bg-[#FFFFFF] text-xs font-medium text-[#000000] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ToastBanner: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-50 bg-[#FFFFFF] text-[#000000] border border-[#B99EF5] px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
    >
      <CheckCircle2 className="w-4 h-4 text-[#8E6CE0] shrink-0" />
      <span>{message}</span>
    </div>
  );
};
