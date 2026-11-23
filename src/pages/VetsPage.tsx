import React, { useState } from 'react';
import { Clock, Mail, MapPin, Phone, Search } from 'lucide-react';
import { VetClinic } from '../types';

interface VetsPageProps {
  vets: VetClinic[];
}

export const VetsPage: React.FC<VetsPageProps> = ({ vets }) => {
  const [search, setSearch] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const filtered = vets.filter((v) => {
    if (emergencyOnly && !v.emergency_24_7) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${v.clinic_name} ${v.vet_name} ${v.city} ${v.address} ${v.services_json.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#000000]">Veterinary Directory</h1>
        <p className="text-sm text-[#000000] mt-1">
          Find verified clinics, routine vaccination centers, and 24/7 emergency animal hospitals.
        </p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinic, doctor, area, or service..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-[#000000] cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={(e) => setEmergencyOnly(e.target.checked)}
          />
          <span>24/7 Emergency Care Only</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((clinic) => (
          <article
            key={clinic.id}
            className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-6 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#000000]">{clinic.clinic_name}</h2>
                  <p className="text-sm text-[#000000] font-medium">{clinic.vet_name}</p>
                </div>
                {clinic.emergency_24_7 ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#D5C2FA] text-[#000000] whitespace-nowrap">
                    24/7 Emergency
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#EAE0FF] text-[#000000] whitespace-nowrap">
                    Wellness Care
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-sm text-[#000000]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span>{clinic.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#000000] shrink-0" />
                  <span>{clinic.hours}</span>
                </p>
              </div>

              <p className="text-xs text-[#000000] pt-1">
                <strong>Services:</strong> {clinic.services_json.join(' · ')}
              </p>
            </div>

            <div className="pt-4 border-t border-[#DCD1F5] flex flex-wrap gap-3">
              <a
                href={`tel:${clinic.phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-xs font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{clinic.phone}</span>
              </a>
              {clinic.email && (
                <a
                  href={`mailto:${clinic.email}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F4EEFF] hover:bg-[#EAE0FF] border border-[#DCD1F5] text-[#000000] text-xs font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Clinic</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
