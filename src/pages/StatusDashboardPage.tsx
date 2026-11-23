import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import {
  AdoptionApplication,
  NotificationItem,
  PageTab,
  Pet,
  SwipeHistoryItem,
  User,
} from '../types';
import { api } from '../services/api';
import { PetCard } from '../components/PetCard';

interface StatusDashboardPageProps {
  user: User | null;
  pets: Pet[];
  favouriteIds: string[];
  applications: AdoptionApplication[];
  swipeHistory: SwipeHistoryItem[];
  notifications: NotificationItem[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onProfileUpdated: (user: User) => void;
  onToggleFavourite: (petId: string) => void;
  onViewPet: (pet: Pet) => void;
  onRefreshDashboard: () => Promise<void>;
  onNavigate: (tab: PageTab) => void;
  onShowToast: (msg: string) => void;
}

export const StatusDashboardPage: React.FC<StatusDashboardPageProps> = ({
  user,
  pets,
  favouriteIds,
  applications,
  swipeHistory,
  notifications,
  onOpenAuth,
  onLogout,
  onProfileUpdated,
  onToggleFavourite,
  onViewPet,
  onRefreshDashboard,
  onNavigate,
  onShowToast,
}) => {
  const [savingProfile, setSavingProfile] = useState(false);

  if (!user) {
    return (
      <section className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-8 space-y-4">
          <h1 className="text-2xl font-semibold text-[#000000]">Sign In to View Your Dashboard</h1>
          <p className="text-sm text-[#000000]">
            Track adoption applications, manage your profile, view saved pets, and review your swipe history.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-6 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
          >
            Join Now / Sign In
          </button>
        </div>
      </section>
    );
  }

  const savedPets = pets.filter((p) => favouriteIds.includes(p.id));
  const listedPets = pets.filter((p) => p.lister_id === user.id);
  const canReview = user.role === 'lister' || user.role === 'admin';

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({
        fullName: String(formData.get('fullName') || ''),
        phone: String(formData.get('phone') || ''),
        city: String(formData.get('city') || ''),
        housingType: String(formData.get('housingType') || 'Apartment'),
      });
      onProfileUpdated(res.user);
      onShowToast('Profile updated.');
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAppStatus = async (appId: string, status: string) => {
    try {
      await api.updateApplicationStatus(appId, status);
      await onRefreshDashboard();
      onShowToast(`Application status updated to ${status}.`);
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCD1F5]">
        <div>
          <p className="text-xs font-semibold text-[#000000] uppercase tracking-wide">
            {user.role} Account
          </p>
          <h1 className="text-3xl font-semibold text-[#000000] mt-1">
            Welcome, {user.full_name}
          </h1>
          <p className="text-sm text-[#000000] mt-0.5">
            {user.email} · {user.city || 'Bengaluru'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              Open Admin Dashboard
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFFFFF] border border-[#DCD1F5] hover:bg-[#EAE0FF] text-sm font-medium text-[#000000] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Adoption Applications */}
      <div>
        <h2 className="text-xl font-semibold text-[#000000] mb-4">
          {canReview ? 'Incoming Adoption Applications' : 'My Adoption Applications'} (
          {applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-[#000000]">No adoption applications submitted yet.</p>
            <button
              type="button"
              onClick={() => onNavigate('browse')}
              className="px-4 py-2 rounded-lg bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] text-sm font-medium cursor-pointer"
            >
              Browse Pets
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={app.pet_image || '/pets/goldie.jpg'}
                    alt={app.pet_name || 'Pet'}
                    className="w-16 h-16 rounded-lg object-cover border border-[#DCD1F5] shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-[#000000]">
                      {app.pet_name || 'Pet'}
                    </h3>
                    <p className="text-xs text-[#000000]">
                      Applicant: {app.applicant_name} · {app.housing_type} · Eligibility:{' '}
                      {app.eligibility_result}
                    </p>
                    <p className="text-xs text-[#000000] mt-1">{app.eligibility_reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-medium px-3 py-1 rounded-md bg-[#EAE0FF] text-[#000000]">
                    {app.status}
                  </span>

                  {canReview && ['Pending', 'Under Review'].includes(app.status) && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAppStatus(app.id, 'Approved')}
                        className="px-3 py-1.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-xs font-medium cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppStatus(app.id, 'Rejected')}
                        className="px-3 py-1.5 rounded-lg bg-[#F4EEFF] border border-[#DCD1F5] text-[#000000] text-xs font-medium cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {!canReview && ['Pending', 'Under Review'].includes(app.status) && (
                    <button
                      type="button"
                      onClick={() => handleAppStatus(app.id, 'Withdrawn')}
                      className="px-3 py-1.5 rounded-lg border border-[#DCD1F5] bg-[#FFFFFF] text-xs font-medium text-[#000000] cursor-pointer"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Management + Notifications/Swipe History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleProfileSave}
          className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[#000000]">Profile Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Full Name</label>
              <input
                name="fullName"
                defaultValue={user.full_name}
                required
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Phone</label>
              <input
                name="phone"
                defaultValue={user.phone}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">City</label>
              <input
                name="city"
                defaultValue={user.city}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Housing Type
              </label>
              <select
                name="housingType"
                defaultValue={user.housing_type || 'Apartment'}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="Apartment">Apartment</option>
                <option value="House with Yard">House with Yard</option>
                <option value="Independent House">Independent House</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="px-4 py-2 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-[#000000] mb-2">Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-[#000000]">No new notifications.</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-lg bg-[#F4EEFF] border border-[#DCD1F5] text-xs text-[#000000]"
                  >
                    <p className="font-semibold text-[#000000]">{n.title}</p>
                    <p className="text-[#000000] mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DCD1F5]">
            <h3 className="text-sm font-semibold text-[#000000] mb-2">
              Recent Swipe History ({swipeHistory.length})
            </h3>
            {swipeHistory.length === 0 ? (
              <p className="text-xs text-[#000000]">No swipes recorded yet.</p>
            ) : (
              <div className="space-y-1.5 text-xs">
                {swipeHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-[#000000]">
                      {item.pet_name} ({item.species})
                    </span>
                    <span className="text-[#000000] capitalize font-medium">{item.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favourite Pets */}
      <div>
        <h2 className="text-xl font-semibold text-[#000000] mb-4">
          Saved Favourites ({savedPets.length})
        </h2>
        {savedPets.length === 0 ? (
          <p className="text-sm text-[#000000]">
            Click the heart icon on any pet card to save companions here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                isFavourite={true}
                onToggleFavourite={onToggleFavourite}
                onViewDetails={onViewPet}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listed Pets (if any) */}
      {listedPets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-[#000000] mb-4">
            My Listed Pets ({listedPets.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listedPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                isFavourite={favouriteIds.includes(pet.id)}
                onToggleFavourite={onToggleFavourite}
                onViewDetails={onViewPet}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
