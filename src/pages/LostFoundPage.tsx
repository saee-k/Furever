import React, { useState } from 'react';
import { MapPin, Phone, Plus, Search } from 'lucide-react';
import { LostFoundReport, User } from '../types';
import { api } from '../services/api';

interface LostFoundPageProps {
  reports: LostFoundReport[];
  user: User | null;
  onRefreshReports: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const LostFoundPage: React.FC<LostFoundPageProps> = ({
  reports,
  user,
  onRefreshReports,
  onShowToast,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [reportTypeFilter, setReportTypeFilter] = useState('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = reports.filter((r) => {
    if (reportTypeFilter !== 'All' && r.report_type !== reportTypeFilter) return false;
    if (speciesFilter !== 'All' && r.species !== speciesFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${r.pet_name} ${r.breed} ${r.color_markings} ${r.last_seen_location}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await api.createLostFound(formData);
      setShowForm(false);
      await onRefreshReports();
      onShowToast('Lost & Found report published.');
    } catch (err) {
      onShowToast((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReunited = async (id: string) => {
    try {
      await api.updateLostFoundStatus(id, 'Reunited');
      await onRefreshReports();
      onShowToast('Report marked as Reunited!');
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#000000]">Lost &amp; Found Pets</h1>
          <p className="text-sm text-[#000000] mt-1">
            Report missing or found pets in your neighbourhood to help reunite families.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Report Lost / Found Pet'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-6 mb-8 space-y-4 text-[#000000]"
        >
          <h2 className="text-lg font-semibold text-[#000000]">Submit a Lost or Found Report</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Report Type *</label>
              <select
                name="reportType"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              >
                <option value="lost">Lost / Missing Pet</option>
                <option value="found">Found Pet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Pet Name</label>
              <input
                name="petName"
                placeholder="e.g. Coco or Unknown"
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
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Color &amp; Markings *
              </label>
              <input
                name="colorMarkings"
                required
                placeholder="e.g. Brown & white, blue collar"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">
                Last Seen / Found Location *
              </label>
              <input
                name="lastSeenLocation"
                required
                placeholder="e.g. 100 Feet Road, Indiranagar"
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Date *</label>
              <input
                type="date"
                name="reportDate"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Contact Name *</label>
              <input
                name="contactName"
                required
                defaultValue={user?.full_name || ''}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Contact Phone *</label>
              <input
                name="contactPhone"
                required
                defaultValue={user?.phone || ''}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#000000] mb-1">Pet Photo</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full px-3 py-1.5 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#000000] mb-1">Description *</label>
            <textarea
              name="description"
              rows={3}
              required
              placeholder="Provide helpful identifying details..."
              className="w-full px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters */}
      <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pet name, markings, or street..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
          />
        </div>
        <select
          value={reportTypeFilter}
          onChange={(e) => setReportTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
        >
          <option value="All">All Reports</option>
          <option value="lost">Lost Pets</option>
          <option value="found">Found Pets</option>
        </select>
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000]"
        >
          <option value="All">All Species</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Rabbit">Rabbits</option>
          <option value="Bird">Birds</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((report) => (
          <article
            key={report.id}
            className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-[#EAE0FF] overflow-hidden">
              <img
                src={report.photo_url || '/pets/goldie.jpg'}
                alt={report.pet_name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-[#000000]">{report.pet_name}</h3>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-md text-[#000000] ${
                      report.status === 'Reunited'
                        ? 'bg-[#D5C2FA]'
                        : report.report_type === 'lost'
                        ? 'bg-[#EAE0FF]'
                        : 'bg-[#F4EEFF] border border-[#DCD1F5]'
                    }`}
                  >
                    {report.status === 'Reunited'
                      ? 'Reunited'
                      : report.report_type === 'lost'
                      ? 'Lost'
                      : 'Found'}
                  </span>
                </div>

                <p className="text-xs text-[#000000]">
                  {report.species} · {report.breed} · {report.report_date}
                </p>

                <p className="text-xs text-[#000000] flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#000000] shrink-0 mt-0.5" />
                  <span>{report.last_seen_location}</span>
                </p>

                <p className="text-sm text-[#000000] leading-relaxed">{report.description}</p>
              </div>

              <div className="pt-3 border-t border-[#DCD1F5] flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#000000]">
                  <Phone className="w-3.5 h-3.5 text-[#000000]" />
                  {report.contact_name} · {report.contact_phone}
                </span>

                {user && report.status === 'Open' && (
                  <button
                    type="button"
                    onClick={() => handleMarkReunited(report.id)}
                    className="px-2.5 py-1 rounded-md bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] font-medium cursor-pointer"
                  >
                    Mark Reunited
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
