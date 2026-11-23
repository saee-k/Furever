import { Response } from 'express';
import { FurEverModel } from '../models/fureverModel';
import { AuthenticatedRequest } from '../middleware/auth';

export const CommunityController = {
  // Lost & Found
  async listLostFound(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reportType, species, status, search } = req.query;
      const reports = await FurEverModel.listLostFound({
        reportType: reportType ? String(reportType) : undefined,
        species: species ? String(species) : undefined,
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
      });
      res.json({ reports });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load lost & found reports: ' + (err as Error).message });
    }
  },

  async createLostFound(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        reportType,
        petName,
        species,
        breed,
        colorMarkings,
        lastSeenLocation,
        reportDate,
        description,
        contactName,
        contactPhone,
        contactEmail,
        photoUrl,
      } = req.body;

      if (!reportType || !colorMarkings || !lastSeenLocation || !description || !contactName || !contactPhone) {
        res.status(400).json({ error: 'Please complete all required Lost & Found fields.' });
        return;
      }

      const uploadedFile = (req as unknown as { file?: { filename: string } }).file;
      const finalPhoto = uploadedFile ? `/uploads/${uploadedFile.filename}` : photoUrl || '/pets/goldie.jpg';

      const validSpecies = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'].includes(species) ? species : 'Dog';
      const created = await FurEverModel.createLostFoundReport({
        id: `lf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        reporter_id: req.user?.userId || null,
        report_type: reportType === 'found' ? 'found' : 'lost',
        pet_name: String(petName || 'Unknown Pet').trim(),
        species: validSpecies,
        breed: String(breed || 'Mixed / Unknown').trim(),
        color_markings: String(colorMarkings).trim(),
        last_seen_location: String(lastSeenLocation).trim(),
        report_date: String(reportDate || new Date().toISOString().slice(0, 10)),
        description: String(description).trim(),
        contact_name: String(contactName).trim(),
        contact_phone: String(contactPhone).trim(),
        contact_email: String(contactEmail || '').trim(),
        photo_url: finalPhoto,
        status: 'Open',
        created_at: new Date().toISOString(),
      });

      res.status(201).json({ report: created });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit report: ' + (err as Error).message });
    }
  },

  async updateLostFoundStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { status } = req.body;
    if (!['Open', 'Reunited', 'Closed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }
    const updated = await FurEverModel.updateLostFoundStatus(String(req.params.id), status);
    if (!updated) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }
    res.json({ report: updated });
  },

  // Veterinary Clinics
  async listVets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { city, emergencyOnly, search } = req.query;
      const vets = await FurEverModel.listVets({
        city: city ? String(city) : undefined,
        emergencyOnly: emergencyOnly === 'true',
        search: search ? String(search) : undefined,
      });
      res.json({ vets });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load veterinary clinics: ' + (err as Error).message });
    }
  },

  async createVet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required.' });
        return;
      }
      const { clinicName, vetName, city, address, phone, email, hours, services, emergency247 } = req.body;
      if (!clinicName || !vetName || !city || !address || !phone) {
        res.status(400).json({ error: 'Clinic name, vet name, city, address, and phone are required.' });
        return;
      }
      const servicesArr = Array.isArray(services)
        ? services
        : String(services || 'General Care, Vaccinations')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

      const created = await FurEverModel.createVetClinic({
        id: `vet-${Date.now()}`,
        clinic_name: String(clinicName).trim(),
        vet_name: String(vetName).trim(),
        city: String(city).trim(),
        address: String(address).trim(),
        phone: String(phone).trim(),
        email: String(email || '').trim(),
        hours: String(hours || '9:00 AM – 8:00 PM').trim(),
        services_json: servicesArr,
        emergency_24_7: emergency247 ? 1 : 0,
        rating: 4.8,
        is_verified: 1,
        created_at: new Date().toISOString(),
      });

      await FurEverModel.logAdminActivity({
        id: `act-${Date.now()}`,
        admin_id: req.user.userId,
        action_type: 'ADD_VET_CLINIC',
        target_table: 'veterinary_clinics',
        target_id: created.id,
        summary: `Added veterinary clinic "${created.clinic_name}"`,
        created_at: new Date().toISOString(),
      });

      res.status(201).json({ vet: created });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add veterinary clinic: ' + (err as Error).message });
    }
  },

  // Notifications
  async listNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const notifications = await FurEverModel.listNotifications(req.user.userId);
    res.json({ notifications });
  },

  async markNotificationRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    await FurEverModel.markNotificationRead(String(req.params.id), req.user.userId);
    res.json({ ok: true });
  },
};
