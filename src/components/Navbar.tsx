import React, { useState } from 'react';
import { Heart, Menu, PawPrint, User as UserIcon, X } from 'lucide-react';
import { PageTab, User } from '../types';

interface NavbarProps {
  currentTab: PageTab;
  onNavigate: (tab: PageTab) => void;
  user: User | null;
  savedCount: number;
  onOpenAuth: () => void;
  onOpenSaved: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  user,
  savedCount,
  onOpenAuth,
  onOpenSaved,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: Array<{ id: PageTab; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'browse', label: 'Browse Pets' },
    { id: 'swipe', label: 'Swipe Match' },
    { id: 'quiz', label: 'Match Quiz' },
    { id: 'lost-found', label: 'Lost & Found' },
    { id: 'vets', label: 'Vets' },
    { id: 'status', label: 'Status' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ id: 'admin', label: 'Admin' });
  }

  const handleLinkClick = (tab: PageTab) => {
    setMobileOpen(false);
    onNavigate(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#DCD1F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: FurEver Logo */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 text-left cursor-pointer shrink-0"
        >
          <span className="w-9 h-9 rounded-xl bg-[#EAE0FF] border border-[#DCD1F5] flex items-center justify-center text-[#000000]">
            <PawPrint className="w-5 h-5" strokeWidth={2} />
          </span>
          <span className="font-semibold text-xl text-[#000000] tracking-tight font-['Poppins']">
            FurEver
          </span>
        </button>

        {/* Right: Desktop Navigation Links & Actions */}
        <div className="hidden lg:flex items-center gap-5">
          <nav className="flex items-center gap-5" aria-label="Main navigation">
            {navLinks.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLinkClick(item.id)}
                  className={`text-sm font-medium transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 ${
                    isActive
                      ? 'text-[#000000] border-[#8E6CE0] font-semibold'
                      : 'text-[#000000] border-transparent hover:border-[#DCD1F5]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 pl-3 border-l border-[#DCD1F5]">
            <button
              type="button"
              onClick={onOpenSaved}
              className="relative p-2 rounded-lg text-[#000000] hover:bg-[#EAE0FF] transition-colors cursor-pointer"
              title="Saved pets"
              aria-label="Saved pets"
            >
              <Heart className={`w-4.5 h-4.5 ${savedCount > 0 ? 'fill-[#8E6CE0] text-[#000000]' : 'text-[#000000]'}`} />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D5C2FA] border border-[#B99EF5] text-[#000000] text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {savedCount}
                </span>
              )}
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => handleLinkClick('status')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserIcon className="w-4 h-4 text-[#000000]" />
                <span>{user.full_name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                Join Now
              </button>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={onOpenSaved}
            className="relative p-2 rounded-lg text-[#000000] hover:bg-[#EAE0FF] cursor-pointer"
            aria-label="Saved pets"
          >
            <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-[#8E6CE0] text-[#000000]' : 'text-[#000000]'}`} />
            {savedCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D5C2FA] border border-[#B99EF5] text-[#000000] text-[10px] font-semibold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-[#DCD1F5] text-[#000000] hover:bg-[#EAE0FF] cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-t border-[#DCD1F5] px-4 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLinkClick(item.id)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EAE0FF] text-[#000000] font-semibold'
                      : 'text-[#000000] hover:bg-[#F4EEFF]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleLinkClick('list-pet')}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-left text-[#000000] hover:bg-[#F4EEFF] cursor-pointer"
            >
              List a Pet
            </button>
          </div>

          <div className="pt-2 border-t border-[#DCD1F5]">
            {user ? (
              <button
                type="button"
                onClick={() => handleLinkClick('status')}
                className="w-full py-2.5 px-4 rounded-lg bg-[#EAE0FF] text-[#000000] text-sm font-medium cursor-pointer"
              >
                Account: {user.full_name}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#D5C2FA] text-[#000000] text-sm font-medium cursor-pointer"
              >
                Join Now / Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
