import React from 'react';
import { Mail, MapPin, PawPrint, Phone } from 'lucide-react';
import { PageTab } from '../types';

interface FooterProps {
  onNavigate: (tab: PageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#DCD1F5] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-[#000000]" />
              <span className="font-semibold text-lg text-[#000000] font-['Poppins']">
                FurEver
              </span>
            </div>
            <p className="text-sm text-[#000000] max-w-xs leading-relaxed">
              A thoughtful pet adoption and matching platform connecting loving families with verified shelter companions.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#000000] mb-3">Explore</h3>
            <ul className="space-y-2 text-sm text-[#000000]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:underline cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('browse')}
                  className="hover:underline cursor-pointer"
                >
                  Browse Pets
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('swipe')}
                  className="hover:underline cursor-pointer"
                >
                  Swipe Match
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('quiz')}
                  className="hover:underline cursor-pointer"
                >
                  Match Quiz
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('lost-found')}
                  className="hover:underline cursor-pointer"
                >
                  Lost &amp; Found
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('vets')}
                  className="hover:underline cursor-pointer"
                >
                  Veterinary Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('list-pet')}
                  className="hover:underline cursor-pointer"
                >
                  List a Pet
                </button>
              </li>
            </ul>
          </div>

          {/* Support Info */}
          <div>
            <h3 className="text-sm font-semibold text-[#000000] mb-3">Adoption Support</h3>
            <div className="space-y-2.5 text-sm text-[#000000]">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#000000]" />
                <a href="mailto:support@furever.com" className="hover:underline">
                  support@furever.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#000000]" />
                <a href="tel:18002347890" className="hover:underline">
                  1800 234 7890
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#000000]" />
                <span>Bengaluru, Karnataka</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#DCD1F5] text-center text-xs text-[#000000]">
          © 2026 FurEver — Pet Adoption &amp; Matching Platform. Built with React, Express &amp; MySQL.
        </div>
      </div>
    </footer>
  );
};
