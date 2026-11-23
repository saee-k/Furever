import { RowDataPacket } from 'mysql2';
import { getMysqlPool, isMysqlConnected } from '../config/db';
import {
  getLocalStore,
  saveLocalStore,
  UserRow,
  PetRow,
  PetImageRow,
  ApplicationRow,
  LostFoundRow,
  VetClinicRow,
  QuizResponseRow,
  NotificationRow,
  AdminActivityRow,
} from '../config/localStore';

function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
    return val as T;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export interface PetFilterParams {
  search?: string;
  species?: string;
  breed?: string;
  ageCategory?: string;
  gender?: string;
  location?: string;
  status?: string;
  sort?: string;
}

export const FurEverModel = {
  // ================= USERS =================
  async findUserByEmail(email: string): Promise<UserRow | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1',
        [cleanEmail]
      );
      return (rows[0] as UserRow) || null;
    }
    const store = getLocalStore();
    return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id: string): Promise<UserRow | null> {
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      return (rows[0] as UserRow) || null;
    }
    const store = getLocalStore();
    return store.users.find((u) => u.id === id) || null;
  },

  async createUser(user: UserRow): Promise<UserRow> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        `INSERT INTO users (id, full_name, email, password_hash, role, phone, city, housing_type, bio, avatar_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.full_name,
          user.email.toLowerCase(),
          user.password_hash,
          user.role,
          user.phone,
          user.city,
          user.housing_type,
          user.bio,
          user.avatar_url,
          user.is_active,
        ]
      );
      return user;
    }
    const store = getLocalStore();
    store.users.push({ ...user, email: user.email.toLowerCase() });
    saveLocalStore();
    return user;
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserRow, 'full_name' | 'phone' | 'city' | 'housing_type' | 'bio' | 'role' | 'is_active'>>
  ): Promise<UserRow | null> {
    if (isMysqlConnected()) {
      const fields: string[] = [];
      const values: unknown[] = [];
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) {
          fields.push(`${k} = ?`);
          values.push(v);
        }
      }
      if (fields.length > 0) {
        values.push(userId);
        await getMysqlPool().query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
      }
      return this.findUserById(userId);
    }
    const store = getLocalStore();
    const idx = store.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    store.users[idx] = { ...store.users[idx], ...updates };
    saveLocalStore();
    return store.users[idx];
  },

  async listAllUsers(): Promise<Omit<UserRow, 'password_hash'>[]> {
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT id, full_name, email, role, phone, city, housing_type, bio, avatar_url, is_active, created_at FROM users ORDER BY created_at DESC'
      );
      return rows as Omit<UserRow, 'password_hash'>[];
    }
    return getLocalStore().users.map(({ password_hash: _pw, ...rest }) => rest);
  },

  // ================= PETS =================
  async listPets(filters: PetFilterParams = {}): Promise<Array<PetRow & { images: PetImageRow[] }>> {
    let rows: PetRow[] = [];
    let images: PetImageRow[] = [];

    if (isMysqlConnected()) {
      const [petRows] = await getMysqlPool().query<RowDataPacket[]>('SELECT * FROM pets ORDER BY is_featured DESC, created_at DESC');
      const [imgRows] = await getMysqlPool().query<RowDataPacket[]>('SELECT * FROM pet_images ORDER BY is_primary DESC, sort_order ASC');
      rows = petRows.map((r) => ({
        ...(r as PetRow),
        personality_json: safeJsonParse<string[]>(r.personality_json, []),
        good_with_json: safeJsonParse<string[]>(r.good_with_json, []),
      }));
      images = imgRows as PetImageRow[];
    } else {
      const store = getLocalStore();
      rows = [...store.pets];
      images = [...store.pet_images];
    }

    let filtered = rows.filter((p) => {
      if (filters.species && filters.species !== 'All' && p.species.toLowerCase() !== filters.species.toLowerCase()) {
        return false;
      }
      if (filters.breed && !p.breed.toLowerCase().includes(filters.breed.toLowerCase())) {
        return false;
      }
      if (filters.ageCategory && filters.ageCategory !== 'All' && p.age_category.toLowerCase() !== filters.ageCategory.toLowerCase()) {
        return false;
      }
      if (filters.gender && filters.gender !== 'All' && p.gender.toLowerCase() !== filters.gender.toLowerCase()) {
        return false;
      }
      if (filters.location && filters.location !== 'All' && !p.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.status && filters.status !== 'All' && p.status.toUpperCase() !== filters.status.toUpperCase()) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = [
          p.name,
          p.breed,
          p.species,
          p.location,
          p.shelter_name,
          p.description,
          ...p.personality_json,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (filters.sort === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => {
        if (b.is_featured !== a.is_featured) return b.is_featured - a.is_featured;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return filtered.map((pet) => ({
      ...pet,
      images: images.filter((img) => img.pet_id === pet.id),
    }));
  },

  async getPetById(petId: string): Promise<(PetRow & { images: PetImageRow[]; lister?: Partial<UserRow> | null }) | null> {
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>('SELECT * FROM pets WHERE id = ? LIMIT 1', [petId]);
      if (!rows[0]) return null;
      const pet = {
        ...(rows[0] as PetRow),
        personality_json: safeJsonParse<string[]>(rows[0].personality_json, []),
        good_with_json: safeJsonParse<string[]>(rows[0].good_with_json, []),
      };
      const [imgRows] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT * FROM pet_images WHERE pet_id = ? ORDER BY is_primary DESC, sort_order ASC',
        [petId]
      );
      const lister = await this.findUserById(pet.lister_id);
      return {
        ...pet,
        images: imgRows as PetImageRow[],
        lister: lister ? { id: lister.id, full_name: lister.full_name, email: lister.email, phone: lister.phone, city: lister.city } : null,
      };
    }

    const store = getLocalStore();
    const pet = store.pets.find((p) => p.id === petId);
    if (!pet) return null;
    const lister = store.users.find((u) => u.id === pet.lister_id);
    return {
      ...pet,
      images: store.pet_images.filter((i) => i.pet_id === pet.id),
      lister: lister ? { id: lister.id, full_name: lister.full_name, email: lister.email, phone: lister.phone, city: lister.city } : null,
    };
  },

  async createPet(pet: PetRow, extraImages: string[] = []): Promise<PetRow & { images: PetImageRow[] }> {
    const imgRows: PetImageRow[] = [
      {
        id: `img-${pet.id}-1`,
        pet_id: pet.id,
        image_url: pet.primary_image_url,
        caption: `${pet.name} portrait`,
        is_primary: 1,
        sort_order: 1,
        created_at: pet.created_at,
      },
      ...extraImages.filter(Boolean).map((url, idx) => ({
        id: `img-${pet.id}-${idx + 2}`,
        pet_id: pet.id,
        image_url: url,
        caption: `${pet.name} photo ${idx + 2}`,
        is_primary: 0,
        sort_order: idx + 2,
        created_at: pet.created_at,
      })),
    ];

    if (isMysqlConnected()) {
      await getMysqlPool().query(
        `INSERT INTO pets (
          id, lister_id, name, species, breed, age_label, age_category, gender, weight,
          activity_level, location, shelter_name, adoption_fee, description,
          personality_json, good_with_json, vaccinated, spayed_neutered, microchipped,
          health_notes, adoption_requirements, status, is_featured, primary_image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pet.id,
          pet.lister_id,
          pet.name,
          pet.species,
          pet.breed,
          pet.age_label,
          pet.age_category,
          pet.gender,
          pet.weight,
          pet.activity_level,
          pet.location,
          pet.shelter_name,
          pet.adoption_fee,
          pet.description,
          JSON.stringify(pet.personality_json),
          JSON.stringify(pet.good_with_json),
          pet.vaccinated,
          pet.spayed_neutered,
          pet.microchipped,
          pet.health_notes,
          pet.adoption_requirements,
          pet.status,
          pet.is_featured,
          pet.primary_image_url,
        ]
      );
      for (const img of imgRows) {
        await getMysqlPool().query(
          'INSERT INTO pet_images (id, pet_id, image_url, caption, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [img.id, img.pet_id, img.image_url, img.caption, img.is_primary, img.sort_order]
        );
      }
      return { ...pet, images: imgRows };
    }

    const store = getLocalStore();
    store.pets.unshift(pet);
    store.pet_images.push(...imgRows);
    saveLocalStore();
    return { ...pet, images: imgRows };
  },

  async updatePetStatus(petId: string, status: 'AVAILABLE' | 'PENDING' | 'ADOPTED'): Promise<void> {
    if (isMysqlConnected()) {
      await getMysqlPool().query('UPDATE pets SET status = ? WHERE id = ?', [status, petId]);
      return;
    }
    const store = getLocalStore();
    const pet = store.pets.find((p) => p.id === petId);
    if (pet) {
      pet.status = status;
      saveLocalStore();
    }
  },

  async deletePet(petId: string): Promise<boolean> {
    if (isMysqlConnected()) {
      const [res] = await getMysqlPool().query('DELETE FROM pets WHERE id = ?', [petId]);
      return (res as { affectedRows: number }).affectedRows > 0;
    }
    const store = getLocalStore();
    const before = store.pets.length;
    store.pets = store.pets.filter((p) => p.id !== petId);
    store.pet_images = store.pet_images.filter((i) => i.pet_id !== petId);
    saveLocalStore();
    return store.pets.length < before;
  },

  // ================= FAVOURITES =================
  async getUserFavouriteIds(userId: string): Promise<string[]> {
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT pet_id FROM favourites WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows.map((r) => String(r.pet_id));
    }
    return getLocalStore()
      .favourites.filter((f) => f.user_id === userId)
      .map((f) => f.pet_id);
  },

  async toggleFavourite(userId: string, petId: string): Promise<{ liked: boolean; petIds: string[] }> {
    if (isMysqlConnected()) {
      const [existing] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT id FROM favourites WHERE user_id = ? AND pet_id = ? LIMIT 1',
        [userId, petId]
      );
      let liked = false;
      if (existing.length > 0) {
        await getMysqlPool().query('DELETE FROM favourites WHERE user_id = ? AND pet_id = ?', [userId, petId]);
      } else {
        await getMysqlPool().query('INSERT INTO favourites (id, user_id, pet_id) VALUES (?, ?, ?)', [
          `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          petId,
        ]);
        liked = true;
      }
      const petIds = await this.getUserFavouriteIds(userId);
      return { liked, petIds };
    }

    const store = getLocalStore();
    const existingIdx = store.favourites.findIndex((f) => f.user_id === userId && f.pet_id === petId);
    let liked = false;
    if (existingIdx >= 0) {
      store.favourites.splice(existingIdx, 1);
    } else {
      store.favourites.push({
        id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        user_id: userId,
        pet_id: petId,
        created_at: new Date().toISOString(),
      });
      liked = true;
    }
    saveLocalStore();
    return {
      liked,
      petIds: store.favourites.filter((f) => f.user_id === userId).map((f) => f.pet_id),
    };
  },

  // ================= SWIPE HISTORY =================
  async recordSwipe(userId: string, petId: string, action: 'like' | 'pass'): Promise<void> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        `INSERT INTO swipe_history (id, user_id, pet_id, action) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE action = VALUES(action), created_at = CURRENT_TIMESTAMP`,
        [`swipe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, petId, action]
      );
      if (action === 'like') {
        await getMysqlPool().query(
          'INSERT IGNORE INTO favourites (id, user_id, pet_id) VALUES (?, ?, ?)',
          [`fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, userId, petId]
        );
      }
      return;
    }
    const store = getLocalStore();
    const existing = store.swipe_history.find((s) => s.user_id === userId && s.pet_id === petId);
    if (existing) {
      existing.action = action;
      existing.created_at = new Date().toISOString();
    } else {
      store.swipe_history.push({
        id: `swipe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: userId,
        pet_id: petId,
        action,
        created_at: new Date().toISOString(),
      });
    }
    if (action === 'like' && !store.favourites.some((f) => f.user_id === userId && f.pet_id === petId)) {
      store.favourites.push({
        id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        user_id: userId,
        pet_id: petId,
        created_at: new Date().toISOString(),
      });
    }
    saveLocalStore();
  },

  async getSwipeHistory(userId: string) {
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>(
        `SELECT sh.*, p.name AS pet_name, p.species, p.breed, p.primary_image_url, p.location
         FROM swipe_history sh
         JOIN pets p ON p.id = sh.pet_id
         WHERE sh.user_id = ?
         ORDER BY sh.created_at DESC`,
        [userId]
      );
      return rows;
    }
    const store = getLocalStore();
    return store.swipe_history
      .filter((s) => s.user_id === userId)
      .map((s) => {
        const pet = store.pets.find((p) => p.id === s.pet_id);
        return {
          ...s,
          pet_name: pet?.name || 'Pet',
          species: pet?.species || 'Dog',
          breed: pet?.breed || '',
          primary_image_url: pet?.primary_image_url || '',
          location: pet?.location || '',
        };
      })
      .reverse();
  },

  // ================= QUIZ RESPONSES =================
  async saveQuizResponse(row: QuizResponseRow): Promise<void> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        `INSERT INTO quiz_responses (
          id, user_id, preferred_species, living_space, daily_availability,
          activity_level, pet_experience, preferred_age, recommended_pet_ids_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.user_id,
          row.preferred_species,
          row.living_space,
          row.daily_availability,
          row.activity_level,
          row.pet_experience,
          row.preferred_age,
          JSON.stringify(row.recommended_pet_ids_json),
        ]
      );
      return;
    }
    const store = getLocalStore();
    store.quiz_responses.unshift(row);
    saveLocalStore();
  },

  // ================= ADOPTION APPLICATIONS =================
  async listApplications(filter?: { applicantId?: string; listerId?: string; status?: string }): Promise<Array<ApplicationRow & { pet_name?: string; pet_image?: string; pet_breed?: string }>> {
    let rows: ApplicationRow[] = [];
    let pets: PetRow[] = [];

    if (isMysqlConnected()) {
      const [appRows] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT * FROM adoption_applications ORDER BY created_at DESC'
      );
      const [petRows] = await getMysqlPool().query<RowDataPacket[]>('SELECT id, name, primary_image_url, breed, lister_id FROM pets');
      rows = appRows as ApplicationRow[];
      pets = petRows as PetRow[];
    } else {
      const store = getLocalStore();
      rows = [...store.adoption_applications];
      pets = store.pets;
    }

    const filtered = rows.filter((a) => {
      if (filter?.applicantId && a.applicant_id !== filter.applicantId) return false;
      if (filter?.listerId) {
        const pet = pets.find((p) => p.id === a.pet_id);
        if (a.lister_id !== filter.listerId && pet?.lister_id !== filter.listerId) return false;
      }
      if (filter?.status && filter.status !== 'All' && a.status !== filter.status) return false;
      return true;
    });

    return filtered
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((a) => {
        const pet = pets.find((p) => p.id === a.pet_id);
        return {
          ...a,
          pet_name: pet?.name || 'Companion',
          pet_image: pet?.primary_image_url || '',
          pet_breed: pet?.breed || '',
        };
      });
  },

  async createApplication(app: ApplicationRow): Promise<ApplicationRow> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        `INSERT INTO adoption_applications (
          id, pet_id, applicant_id, lister_id, applicant_name, applicant_email,
          applicant_phone, city, housing_type, has_yard, pet_experience,
          household_members, daily_alone_hours, fit_reason,
          eligibility_result, eligibility_reason, status, reviewer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          app.id,
          app.pet_id,
          app.applicant_id,
          app.lister_id,
          app.applicant_name,
          app.applicant_email,
          app.applicant_phone,
          app.city,
          app.housing_type,
          app.has_yard,
          app.pet_experience,
          app.household_members,
          app.daily_alone_hours,
          app.fit_reason,
          app.eligibility_result,
          app.eligibility_reason,
          app.status,
          app.reviewer_notes,
        ]
      );
      if (app.status !== 'Rejected' && app.status !== 'Withdrawn') {
        await this.updatePetStatus(app.pet_id, 'PENDING');
      }
      return app;
    }

    const store = getLocalStore();
    store.adoption_applications.unshift(app);
    if (app.status !== 'Rejected' && app.status !== 'Withdrawn') {
      const pet = store.pets.find((p) => p.id === app.pet_id);
      if (pet) pet.status = 'PENDING';
    }
    saveLocalStore();
    return app;
  },

  async updateApplicationStatus(
    appId: string,
    status: ApplicationRow['status'],
    reviewerNotes?: string
  ): Promise<ApplicationRow | null> {
    const now = new Date().toISOString();
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        'UPDATE adoption_applications SET status = ?, reviewer_notes = COALESCE(?, reviewer_notes) WHERE id = ?',
        [status, reviewerNotes ?? null, appId]
      );
      const [rows] = await getMysqlPool().query<RowDataPacket[]>('SELECT * FROM adoption_applications WHERE id = ? LIMIT 1', [appId]);
      const updated = (rows[0] as ApplicationRow) || null;
      if (updated) {
        if (status === 'Approved') {
          await this.updatePetStatus(updated.pet_id, 'ADOPTED');
        } else if (status === 'Rejected' || status === 'Withdrawn') {
          const [others] = await getMysqlPool().query<RowDataPacket[]>(
            "SELECT id FROM adoption_applications WHERE pet_id = ? AND id != ? AND status IN ('Pending', 'Under Review', 'Approved')",
            [updated.pet_id, appId]
          );
          if (others.length === 0) {
            await this.updatePetStatus(updated.pet_id, 'AVAILABLE');
          }
        } else {
          await this.updatePetStatus(updated.pet_id, 'PENDING');
        }
      }
      return updated;
    }

    const store = getLocalStore();
    const app = store.adoption_applications.find((a) => a.id === appId);
    if (!app) return null;
    app.status = status;
    if (reviewerNotes !== undefined) app.reviewer_notes = reviewerNotes;
    app.updated_at = now;

    const pet = store.pets.find((p) => p.id === app.pet_id);
    if (pet) {
      if (status === 'Approved') {
        pet.status = 'ADOPTED';
      } else if (status === 'Rejected' || status === 'Withdrawn') {
        const hasOtherActive = store.adoption_applications.some(
          (o) => o.pet_id === app.pet_id && o.id !== appId && ['Pending', 'Under Review', 'Approved'].includes(o.status)
        );
        if (!hasOtherActive) pet.status = 'AVAILABLE';
      } else {
        pet.status = 'PENDING';
      }
    }
    saveLocalStore();
    return app;
  },

  // ================= LOST & FOUND =================
  async listLostFound(filters?: { reportType?: string; species?: string; status?: string; search?: string }): Promise<LostFoundRow[]> {
    let rows: LostFoundRow[] = [];
    if (isMysqlConnected()) {
      const [res] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT * FROM lost_found_reports ORDER BY created_at DESC'
      );
      rows = res as LostFoundRow[];
    } else {
      rows = [...getLocalStore().lost_found_reports];
    }

    return rows.filter((r) => {
      if (filters?.reportType && filters.reportType !== 'All' && r.report_type !== filters.reportType) return false;
      if (filters?.species && filters.species !== 'All' && r.species.toLowerCase() !== filters.species.toLowerCase()) return false;
      if (filters?.status && filters.status !== 'All' && r.status.toLowerCase() !== filters.status.toLowerCase()) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const hay = `${r.pet_name} ${r.breed} ${r.color_markings} ${r.last_seen_location} ${r.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  },

  async createLostFoundReport(report: LostFoundRow): Promise<LostFoundRow> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        `INSERT INTO lost_found_reports (
          id, reporter_id, report_type, pet_name, species, breed, color_markings,
          last_seen_location, report_date, description, contact_name, contact_phone,
          contact_email, photo_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          report.id,
          report.reporter_id,
          report.report_type,
          report.pet_name,
          report.species,
          report.breed,
          report.color_markings,
          report.last_seen_location,
          report.report_date,
          report.description,
          report.contact_name,
          report.contact_phone,
          report.contact_email,
          report.photo_url,
          report.status,
        ]
      );
      return report;
    }
    const store = getLocalStore();
    store.lost_found_reports.unshift(report);
    saveLocalStore();
    return report;
  },

  async updateLostFoundStatus(id: string, status: LostFoundRow['status']): Promise<LostFoundRow | null> {
    if (isMysqlConnected()) {
      await getMysqlPool().query('UPDATE lost_found_reports SET status = ? WHERE id = ?', [status, id]);
      const [rows] = await getMysqlPool().query<RowDataPacket[]>('SELECT * FROM lost_found_reports WHERE id = ? LIMIT 1', [id]);
      return (rows[0] as LostFoundRow) || null;
    }
    const store = getLocalStore();
    const item = store.lost_found_reports.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    saveLocalStore();
    return item;
  },

  // ================= VETERINARY CLINICS =================
  async listVets(filters?: { city?: string; emergencyOnly?: boolean; search?: string }): Promise<VetClinicRow[]> {
    let rows: VetClinicRow[] = [];
    if (isMysqlConnected()) {
      const [res] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT * FROM veterinary_clinics ORDER BY emergency_24_7 DESC, rating DESC'
      );
      rows = res.map((r) => ({
        ...(r as VetClinicRow),
        services_json: safeJsonParse<string[]>(r.services_json, []),
      }));
    } else {
      rows = [...getLocalStore().veterinary_clinics];
    }

    return rows.filter((v) => {
      if (filters?.emergencyOnly && !v.emergency_24_7) return false;
      if (filters?.city && filters.city !== 'All' && !v.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const hay = `${v.clinic_name} ${v.vet_name} ${v.city} ${v.address} ${v.services_json.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  },

  async createVetClinic(vet: VetClinicRow): Promise<VetClinicRow> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        `INSERT INTO veterinary_clinics (
          id, clinic_name, vet_name, city, address, phone, email, hours, services_json, emergency_24_7, rating, is_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vet.id,
          vet.clinic_name,
          vet.vet_name,
          vet.city,
          vet.address,
          vet.phone,
          vet.email,
          vet.hours,
          JSON.stringify(vet.services_json),
          vet.emergency_24_7,
          vet.rating,
          vet.is_verified,
        ]
      );
      return vet;
    }
    const store = getLocalStore();
    store.veterinary_clinics.unshift(vet);
    saveLocalStore();
    return vet;
  },

  async deleteVetClinic(id: string): Promise<boolean> {
    if (isMysqlConnected()) {
      const [res] = await getMysqlPool().query('DELETE FROM veterinary_clinics WHERE id = ?', [id]);
      return (res as { affectedRows: number }).affectedRows > 0;
    }
    const store = getLocalStore();
    const before = store.veterinary_clinics.length;
    store.veterinary_clinics = store.veterinary_clinics.filter((v) => v.id !== id);
    saveLocalStore();
    return store.veterinary_clinics.length < before;
  },

  // ================= NOTIFICATIONS & ADMIN ACTIVITY =================
  async createNotification(n: NotificationRow): Promise<void> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)',
        [n.id, n.user_id, n.title, n.message, n.type, n.is_read]
      );
      return;
    }
    const store = getLocalStore();
    store.notifications.unshift(n);
    saveLocalStore();
  },

  async listNotifications(userId: string): Promise<NotificationRow[]> {
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
        [userId]
      );
      return rows as NotificationRow[];
    }
    return getLocalStore().notifications.filter((n) => n.user_id === userId).slice(0, 30);
  },

  async markNotificationRead(id: string, userId: string): Promise<void> {
    if (isMysqlConnected()) {
      await getMysqlPool().query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
      return;
    }
    const store = getLocalStore();
    const item = store.notifications.find((n) => n.id === id && n.user_id === userId);
    if (item) {
      item.is_read = 1;
      saveLocalStore();
    }
  },

  async logAdminActivity(act: AdminActivityRow): Promise<void> {
    if (isMysqlConnected()) {
      await getMysqlPool().query(
        'INSERT INTO admin_activity (id, admin_id, action_type, target_table, target_id, summary) VALUES (?, ?, ?, ?, ?, ?)',
        [act.id, act.admin_id, act.action_type, act.target_table, act.target_id, act.summary]
      );
      return;
    }
    const store = getLocalStore();
    store.admin_activity.unshift(act);
    saveLocalStore();
  },

  async getPlatformStats() {
    const pets = await this.listPets();
    const apps = await this.listApplications();
    const users = await this.listAllUsers();
    const reports = await this.listLostFound();
    const vets = await this.listVets();

    const availablePets = pets.filter((p) => p.status === 'AVAILABLE').length;
    const adoptedPets = pets.filter((p) => p.status === 'ADOPTED').length;
    const pendingApps = apps.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length;
    const approvedApps = apps.filter((a) => a.status === 'Approved').length;
    const openLostFound = reports.filter((r) => r.status === 'Open').length;
    const reunitedLostFound = reports.filter((r) => r.status === 'Reunited').length;

    let recentActivity: AdminActivityRow[] = [];
    if (isMysqlConnected()) {
      const [rows] = await getMysqlPool().query<RowDataPacket[]>('SELECT * FROM admin_activity ORDER BY created_at DESC LIMIT 20');
      recentActivity = rows as AdminActivityRow[];
    } else {
      recentActivity = getLocalStore().admin_activity.slice(0, 20);
    }

    return {
      totalPets: pets.length,
      availablePets,
      adoptedPets,
      totalUsers: users.length,
      totalApplications: apps.length,
      pendingApplications: pendingApps,
      approvedApplications: approvedApps,
      totalLostFound: reports.length,
      openLostFound,
      reunitedLostFound,
      totalVets: vets.length,
      recentActivity,
    };
  },
};
