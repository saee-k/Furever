import React, { useEffect, useState } from 'react';
import { AdminDashboardData, User } from '../types';
import { api } from '../services/api';

interface AdminPageProps {
  user: User | null;
  onOpenAuth: () => void;
  onGlobalDataChange: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  user,
  onOpenAuth,
  onGlobalDataChange,
  onShowToast,
}) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'pets' | 'users' | 'lostfound' | 'vets'>('applications');

  const loadAdmin = async () => {
    try {
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdmin();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <section className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-2xl p-8 space-y-4">
          <h1 className="text-2xl font-semibold text-[#000000]">Administrator Access Required</h1>
          <p className="text-sm text-[#000000]">
            Sign in with an administrator account (admin@furever.com) to manage platform listings, users, and applications.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
          >
            Sign In as Admin
          </button>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-sm text-[#000000]">Loading admin dashboard...</p>
      </section>
    );
  }

  const handleAppAction = async (id: string, status: string) => {
    try {
      await api.updateApplicationStatus(id, status);
      await Promise.all([loadAdmin(), onGlobalDataChange()]);
      onShowToast(`Application ${status.toLowerCase()}.`);
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  const handleTogglePetStatus = async (id: string, nextStatus: string) => {
    try {
      await api.updatePetStatus(id, nextStatus);
      await Promise.all([loadAdmin(), onGlobalDataChange()]);
      onShowToast(`Pet marked as ${nextStatus}.`);
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  const handleDeletePet = async (id: string) => {
    try {
      await api.deletePet(id);
      await Promise.all([loadAdmin(), onGlobalDataChange()]);
      onShowToast('Pet listing removed.');
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  const handleToggleUser = async (id: string, nextActive: boolean) => {
    try {
      await api.updateAdminUser(id, { is_active: nextActive });
      await loadAdmin();
      onShowToast('User status updated.');
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  const handleAddVet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api.createVet({
        clinicName: String(fd.get('clinicName') || ''),
        vetName: String(fd.get('vetName') || ''),
        city: String(fd.get('city') || ''),
        address: String(fd.get('address') || ''),
        phone: String(fd.get('phone') || ''),
        services: String(fd.get('services') || ''),
      });
      e.currentTarget.reset();
      await Promise.all([loadAdmin(), onGlobalDataChange()]);
      onShowToast('Veterinary clinic added.');
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  const handleDeleteVet = async (id: string) => {
    try {
      await api.deleteVet(id);
      await Promise.all([loadAdmin(), onGlobalDataChange()]);
      onShowToast('Veterinary clinic deleted.');
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  const handleMarkReunited = async (id: string) => {
    try {
      await api.updateLostFoundStatus(id, 'Reunited');
      await Promise.all([loadAdmin(), onGlobalDataChange()]);
      onShowToast('Report marked as Reunited.');
    } catch (err) {
      onShowToast((err as Error).message);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#000000]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#000000]">Admin Dashboard</h1>
          <p className="text-sm text-[#000000] mt-1">
            Manage users, pet listings, adoption applications, lost &amp; found reports, and clinics.
          </p>
        </div>
        <button
          type="button"
          onClick={loadAdmin}
          className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE0FF] border border-[#DCD1F5] text-sm font-medium text-[#000000] cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
          <p className="text-2xl font-semibold text-[#000000] tabular-nums">{data.stats.totalUsers}</p>
          <p className="text-xs text-[#000000] mt-1">Registered Users</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
          <p className="text-2xl font-semibold text-[#000000] tabular-nums">{data.stats.totalPets}</p>
          <p className="text-xs text-[#000000] mt-1">Pet Listings</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
          <p className="text-2xl font-semibold text-[#000000] tabular-nums">
            {data.stats.pendingApplications}
          </p>
          <p className="text-xs text-[#000000] mt-1">Pending Applications</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5">
          <p className="text-2xl font-semibold text-[#000000] tabular-nums">{data.stats.openLostFound}</p>
          <p className="text-xs text-[#000000] mt-1">Open Lost/Found Reports</p>
        </div>
      </div>

      {/* Management Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['applications', `Applications (${data.applications.length})`],
            ['pets', `Pets (${data.pets.length})`],
            ['users', `Users (${data.users.length})`],
            ['lostfound', `Lost & Found (${data.lostFound.length})`],
            ['vets', `Vets (${data.vets.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer text-[#000000] ${
              activeTab === id
                ? 'bg-[#D5C2FA] border-[#B99EF5] font-semibold'
                : 'bg-[#FFFFFF] border-[#DCD1F5] hover:bg-[#EAE0FF]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'applications' && (
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left text-[#000000]">
            <thead className="bg-[#EAE0FF] text-xs uppercase text-[#000000]">
              <tr>
                <th className="p-3.5">Pet</th>
                <th className="p-3.5">Applicant</th>
                <th className="p-3.5">Housing</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD1F5]">
              {data.applications.map((a) => (
                <tr key={a.id}>
                  <td className="p-3.5 font-medium">{a.pet_name}</td>
                  <td className="p-3.5">
                    {a.applicant_name}
                    <div className="text-xs text-[#000000]">{a.applicant_email}</div>
                  </td>
                  <td className="p-3.5">{a.housing_type}</td>
                  <td className="p-3.5">{a.status}</td>
                  <td className="p-3.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAppAction(a.id, 'Approved')}
                      className="px-3 py-1 rounded bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-xs font-medium cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAppAction(a.id, 'Rejected')}
                      className="px-3 py-1 rounded bg-[#F4EEFF] border border-[#DCD1F5] text-[#000000] text-xs cursor-pointer"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pets' && (
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left text-[#000000]">
            <thead className="bg-[#EAE0FF] text-xs uppercase text-[#000000]">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Breed</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD1F5]">
              {data.pets.map((p) => (
                <tr key={p.id}>
                  <td className="p-3.5 font-medium">{p.name}</td>
                  <td className="p-3.5">
                    {p.species} · {p.breed}
                  </td>
                  <td className="p-3.5">{p.location}</td>
                  <td className="p-3.5">{p.status}</td>
                  <td className="p-3.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleTogglePetStatus(
                          p.id,
                          p.status === 'AVAILABLE' ? 'ADOPTED' : 'AVAILABLE'
                        )
                      }
                      className="px-3 py-1 rounded bg-[#EAE0FF] hover:bg-[#D5C2FA] text-[#000000] text-xs font-medium cursor-pointer"
                    >
                      Mark {p.status === 'AVAILABLE' ? 'Adopted' : 'Available'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePet(p.id)}
                      className="px-3 py-1 rounded bg-[#F4EEFF] border border-[#DCD1F5] text-[#000000] text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left text-[#000000]">
            <thead className="bg-[#EAE0FF] text-xs uppercase text-[#000000]">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD1F5]">
              {data.users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3.5 font-medium">{u.full_name}</td>
                  <td className="p-3.5">{u.email}</td>
                  <td className="p-3.5 capitalize">{u.role}</td>
                  <td className="p-3.5">{u.is_active ? 'Active' : 'Suspended'}</td>
                  <td className="p-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleUser(u.id, !u.is_active)}
                      className="px-3 py-1 rounded border border-[#DCD1F5] bg-[#F4EEFF] hover:bg-[#EAE0FF] text-[#000000] text-xs cursor-pointer"
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'lostfound' && (
        <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left text-[#000000]">
            <thead className="bg-[#EAE0FF] text-xs uppercase text-[#000000]">
              <tr>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Pet</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD1F5]">
              {data.lostFound.map((r) => (
                <tr key={r.id}>
                  <td className="p-3.5 uppercase text-xs font-medium">{r.report_type}</td>
                  <td className="p-3.5 font-medium">
                    {r.pet_name} ({r.species})
                  </td>
                  <td className="p-3.5">{r.last_seen_location}</td>
                  <td className="p-3.5">{r.status}</td>
                  <td className="p-3.5">
                    {r.status !== 'Reunited' && (
                      <button
                        type="button"
                        onClick={() => handleMarkReunited(r.id)}
                        className="px-3 py-1 rounded bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-xs font-medium cursor-pointer"
                      >
                        Mark Reunited
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'vets' && (
        <div className="space-y-5">
          <form
            onSubmit={handleAddVet}
            className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <input
              name="clinicName"
              required
              placeholder="Clinic Name *"
              className="px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
            <input
              name="vetName"
              required
              placeholder="Veterinarian Name *"
              className="px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
            <input
              name="city"
              required
              defaultValue="Bengaluru"
              placeholder="City / Area *"
              className="px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
            <input
              name="address"
              required
              placeholder="Street Address *"
              className="px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
            <input
              name="phone"
              required
              placeholder="Phone *"
              className="px-3 py-2 rounded-lg border border-[#DCD1F5] bg-[#F4EEFF] text-sm text-[#000000] placeholder:text-[#000000]/55"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#D5C2FA] hover:bg-[#C4AEF7] text-[#000000] text-sm font-medium cursor-pointer"
            >
              Add Clinic
            </button>
          </form>

          <div className="bg-[#FFFFFF] border border-[#DCD1F5] rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-left text-[#000000]">
              <thead className="bg-[#EAE0FF] text-xs uppercase text-[#000000]">
                <tr>
                  <th className="p-3.5">Clinic</th>
                  <th className="p-3.5">Veterinarian</th>
                  <th className="p-3.5">Area</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD1F5]">
                {data.vets.map((v) => (
                  <tr key={v.id}>
                    <td className="p-3.5 font-medium">{v.clinic_name}</td>
                    <td className="p-3.5">{v.vet_name}</td>
                    <td className="p-3.5">{v.city}</td>
                    <td className="p-3.5">{v.phone}</td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteVet(v.id)}
                        className="px-3 py-1 rounded bg-[#F4EEFF] border border-[#DCD1F5] text-[#000000] text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
