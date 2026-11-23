import React, { useCallback, useEffect, useState } from 'react';
import {
  AdoptionApplication,
  LostFoundReport,
  NotificationItem,
  PageTab,
  Pet,
  PublicStats,
  SwipeHistoryItem,
  User,
  VetClinic,
} from './types';
import { api, getAuthToken, setAuthToken } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import {
  ApplicationModal,
  AuthModal,
  PetDetailsModal,
  SavedModal,
  ToastBanner,
} from './components/Modals';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { SwipePage } from './pages/SwipePage';
import { QuizPage } from './pages/QuizPage';
import { ListPetPage } from './pages/ListPetPage';
import { LostFoundPage } from './pages/LostFoundPage';
import { VetsPage } from './pages/VetsPage';
import { StatusDashboardPage } from './pages/StatusDashboardPage';
import { AdminPage } from './pages/AdminPage';

/**
 * Main Application Component for FurEver.
 * Manages page navigation, shared data fetched from Express/MySQL,
 * user authentication state, and global modals.
 */
export default function App() {
  // Active page tab (replaces multi-page reloads for smooth SPA navigation)
  const [currentTab, setCurrentTab] = useState<PageTab>('home');

  // Public data loaded from /api endpoints
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [vets, setVets] = useState<VetClinic[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Authenticated user data
  const [user, setUser] = useState<User | null>(null);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modal & toast UI states
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [applyingPet, setApplyingPet] = useState<Pet | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary notification banner at bottom-right
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Fetch public catalog data: pets, health stats, lost & found reports, and vet clinics
  const loadPublicData = useCallback(async () => {
    const [healthRes, petsRes, reportsRes, vetsRes] = await Promise.all([
      api.getHealth(),
      api.listPets(),
      api.listLostFound(),
      api.listVets(),
    ]);
    setStats(healthRes.stats);
    setPets(petsRes.pets);
    setReports(reportsRes.reports);
    setVets(vetsRes.vets);
  }, []);

  // Fetch logged-in user profile, favourites, applications, and swipe history
  const loadUserDashboardData = useCallback(async () => {
    if (!getAuthToken()) return;
    try {
      const [meRes, appsRes, swipeRes] = await Promise.all([
        api.getMe(),
        api.listApplications(),
        api.getSwipeHistory(),
      ]);
      setUser(meRes.user);
      setFavouriteIds(meRes.favouriteIds || []);
      setNotifications(meRes.notifications || []);
      setApplications(appsRes.applications || []);
      setSwipeHistory(swipeRes.history || []);
    } catch {
      // Clear expired or invalid JWT token
      setAuthToken('');
      setUser(null);
      setFavouriteIds([]);
      setApplications([]);
      setSwipeHistory([]);
      setNotifications([]);
    }
  }, []);

  // Initial load on first render
  useEffect(() => {
    const init = async () => {
      try {
        await loadPublicData();
        await loadUserDashboardData();
      } catch (err) {
        showToast((err as Error).message || 'Could not load FurEver data.');
      } finally {
        setLoadingInitial(false);
      }
    };
    init();
  }, [loadPublicData, loadUserDashboardData, showToast]);

  // Switch tabs and scroll smoothly to the top
  const handleNavigate = (tab: PageTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch full pet details (including image gallery & shelter contact) before opening modal
  const handleViewPet = async (pet: Pet) => {
    setSelectedPet(pet);
    try {
      const res = await api.getPet(pet.id);
      setSelectedPet(res.pet);
    } catch {
      // Keep the summary card pet data if detail refresh fails
    }
  };

  // Toggle saved/favourite state for a pet
  const handleToggleFavourite = async (petId: string) => {
    if (!user) {
      showToast('Please sign in to save pets to your favourites.');
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await api.toggleFavorite(petId);
      setFavouriteIds(res.petIds);
      showToast(res.liked ? 'Added to your saved pets.' : 'Removed from saved pets.');
    } catch (err) {
      showToast((err as Error).message);
    }
  };

  // Record a Swipe Match decision (Like / Pass)
  const handleSwipeAction = async (petId: string, action: 'like' | 'pass') => {
    if (!user) {
      if (action === 'like') {
        setFavouriteIds((prev) => (prev.includes(petId) ? prev : [...prev, petId]));
        showToast('Liked! Sign in anytime to save matches permanently.');
      }
      return;
    }

    try {
      const res = await api.recordSwipe(petId, action);
      setFavouriteIds(res.petIds);
      const swipeRes = await api.getSwipeHistory();
      setSwipeHistory(swipeRes.history || []);
      if (action === 'like') {
        showToast('Saved to your matches!');
      }
    } catch (err) {
      showToast((err as Error).message);
    }
  };

  // Open adoption application modal (requires sign-in)
  const handleOpenApply = (pet: Pet) => {
    if (!user) {
      showToast('Please sign in before submitting an adoption application.');
      setSelectedPet(null);
      setShowAuthModal(true);
      return;
    }
    setSelectedPet(null);
    setApplyingPet(pet);
  };

  // Called after user logs in or registers
  const handleAuthSuccess = async (loggedUser: User, favIds: string[]) => {
    setUser(loggedUser);
    setFavouriteIds(favIds);
    setShowAuthModal(false);
    await loadUserDashboardData();
    showToast(`Welcome, ${loggedUser.full_name}!`);
  };

  // Log out user and reset private session state
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    }
    setAuthToken('');
    setUser(null);
    setFavouriteIds([]);
    setApplications([]);
    setSwipeHistory([]);
    setNotifications([]);
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
    showToast('Signed out.');
  };

  const savedPets = pets.filter((pet) => favouriteIds.includes(pet.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EEFF] text-[#000000]">
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        user={user}
        savedCount={favouriteIds.length}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenSaved={() => setShowSavedModal(true)}
      />

      <main className="flex-1">
        {loadingInitial ? (
          <div className="max-w-6xl mx-auto px-4 py-20 text-center text-sm text-[#000000]">
            Loading FurEver companions...
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                pets={pets}
                favouriteIds={favouriteIds}
                stats={stats}
                onNavigate={handleNavigate}
                onToggleFavourite={handleToggleFavourite}
                onViewPet={handleViewPet}
              />
            )}

            {currentTab === 'browse' && (
              <BrowsePage
                pets={pets}
                favouriteIds={favouriteIds}
                onToggleFavourite={handleToggleFavourite}
                onViewPet={handleViewPet}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'swipe' && (
              <SwipePage
                pets={pets}
                favouriteIds={favouriteIds}
                onSwipeAction={handleSwipeAction}
                onViewPet={handleViewPet}
                onOpenSaved={() => setShowSavedModal(true)}
              />
            )}

            {currentTab === 'quiz' && (
              <QuizPage
                favouriteIds={favouriteIds}
                onToggleFavourite={handleToggleFavourite}
                onViewPet={handleViewPet}
                onShowToast={showToast}
              />
            )}

            {currentTab === 'list-pet' && (
              <ListPetPage
                user={user}
                onOpenAuth={() => setShowAuthModal(true)}
                onPetCreated={async () => {
                  await loadPublicData();
                  handleNavigate('browse');
                }}
                onShowToast={showToast}
              />
            )}

            {currentTab === 'lost-found' && (
              <LostFoundPage
                reports={reports}
                user={user}
                onRefreshReports={async () => {
                  const res = await api.listLostFound();
                  setReports(res.reports);
                }}
                onShowToast={showToast}
              />
            )}

            {currentTab === 'vets' && <VetsPage vets={vets} />}

            {currentTab === 'status' && (
              <StatusDashboardPage
                user={user}
                pets={pets}
                favouriteIds={favouriteIds}
                applications={applications}
                swipeHistory={swipeHistory}
                notifications={notifications}
                onOpenAuth={() => setShowAuthModal(true)}
                onLogout={handleLogout}
                onProfileUpdated={(updated) => setUser(updated)}
                onToggleFavourite={handleToggleFavourite}
                onViewPet={handleViewPet}
                onRefreshDashboard={async () => {
                  await loadPublicData();
                  await loadUserDashboardData();
                }}
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}

            {currentTab === 'admin' && (
              <AdminPage
                user={user}
                onOpenAuth={() => setShowAuthModal(true)}
                onGlobalDataChange={async () => {
                  await loadPublicData();
                  await loadUserDashboardData();
                }}
                onShowToast={showToast}
              />
            )}
          </>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Modals */}
      {selectedPet && (
        <PetDetailsModal
          pet={selectedPet}
          isFavourite={favouriteIds.includes(selectedPet.id)}
          onClose={() => setSelectedPet(null)}
          onToggleFavourite={handleToggleFavourite}
          onOpenApply={handleOpenApply}
        />
      )}

      {applyingPet && user && (
        <ApplicationModal
          pet={applyingPet}
          user={user}
          onClose={() => setApplyingPet(null)}
          onSubmitted={async () => {
            setApplyingPet(null);
            await loadPublicData();
            await loadUserDashboardData();
            handleNavigate('status');
          }}
          onShowToast={showToast}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onShowToast={showToast}
        />
      )}

      {showSavedModal && (
        <SavedModal
          pets={savedPets}
          onClose={() => setShowSavedModal(false)}
          onViewPet={(pet) => {
            setShowSavedModal(false);
            handleViewPet(pet);
          }}
          onRemoveFavourite={handleToggleFavourite}
          onStartSwiping={() => {
            setShowSavedModal(false);
            handleNavigate('swipe');
          }}
        />
      )}

      <ToastBanner message={toastMessage} />
    </div>
  );
}
