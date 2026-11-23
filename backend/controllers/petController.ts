import { Response } from 'express';
import { FurEverModel } from '../models/fureverModel';
import { AuthenticatedRequest } from '../middleware/auth';

export const PetController = {
  async listPets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, species, breed, ageCategory, gender, location, status, sort } = req.query;
      const pets = await FurEverModel.listPets({
        search: search ? String(search) : undefined,
        species: species ? String(species) : undefined,
        breed: breed ? String(breed) : undefined,
        ageCategory: ageCategory ? String(ageCategory) : undefined,
        gender: gender ? String(gender) : undefined,
        location: location ? String(location) : undefined,
        status: status ? String(status) : undefined,
        sort: sort ? String(sort) : undefined,
      });
      res.json({ pets });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load pets: ' + (err as Error).message });
    }
  },

  async getPet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pet = await FurEverModel.getPetById(String(req.params.id));
      if (!pet) {
        res.status(404).json({ error: 'Pet not found.' });
        return;
      }
      res.json({ pet });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch pet details: ' + (err as Error).message });
    }
  },

  async createPet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Please sign in to list a pet.' });
        return;
      }

      const {
        name,
        species,
        breed,
        ageLabel,
        ageCategory,
        gender,
        weight,
        activityLevel,
        location,
        shelterName,
        adoptionFee,
        description,
        personality,
        goodWith,
        vaccinated,
        spayedNeutered,
        microchipped,
        healthNotes,
        adoptionRequirements,
        status,
        imageUrl,
      } = req.body;

      if (!name || !species || !breed || !location || !description) {
        res.status(400).json({ error: 'Pet name, species, breed, location, and description are required.' });
        return;
      }

      const uploadedFile = (req as unknown as { file?: { filename: string } }).file;
      const primaryImage = uploadedFile
        ? `/uploads/${uploadedFile.filename}`
        : imageUrl || '/pets/daisy.jpg';

      const parseList = (val: unknown, fallback: string[]): string[] => {
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === 'string' && val.trim()) {
          return val.split(',').map((s) => s.trim()).filter(Boolean);
        }
        return fallback;
      };

      const petId = `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const validSpecies = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'].includes(species) ? species : 'Dog';
      const validAgeCat = ['Young', 'Adult', 'Senior'].includes(ageCategory) ? ageCategory : 'Young';
      const validGender = gender === 'Female' ? 'Female' : 'Male';
      const validActivity = ['Low', 'Moderate', 'High'].includes(activityLevel) ? activityLevel : 'Moderate';
      const validStatus = ['AVAILABLE', 'PENDING', 'ADOPTED'].includes(status) ? status : 'AVAILABLE';

      const created = await FurEverModel.createPet({
        id: petId,
        lister_id: req.user.userId,
        name: String(name).trim(),
        species: validSpecies,
        breed: String(breed).trim(),
        age_label: String(ageLabel || '1 year').trim(),
        age_category: validAgeCat,
        gender: validGender,
        weight: String(weight || '10 kg').trim(),
        activity_level: validActivity,
        location: String(location).trim(),
        shelter_name: String(shelterName || req.user.fullName).trim(),
        adoption_fee: String(adoptionFee || 'Free Adoption').trim(),
        description: String(description).trim(),
        personality_json: parseList(personality, ['Friendly', 'Affectionate', 'Playful']),
        good_with_json: parseList(goodWith, ['Children', 'Apartments']),
        vaccinated: vaccinated === 'false' || vaccinated === false ? 0 : 1,
        spayed_neutered: spayedNeutered === 'false' || spayedNeutered === false ? 0 : 1,
        microchipped: microchipped === 'true' || microchipped === true ? 1 : 0,
        health_notes: String(healthNotes || 'Veterinary wellness check completed.').trim(),
        adoption_requirements: String(adoptionRequirements || 'Loving indoor home with regular care.').trim(),
        status: validStatus,
        is_featured: 0,
        primary_image_url: primaryImage,
        created_at: new Date().toISOString(),
      });

      res.status(201).json({ pet: created });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create pet listing: ' + (err as Error).message });
    }
  },

  async updatePetStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }
      const pet = await FurEverModel.getPetById(String(req.params.id));
      if (!pet) {
        res.status(404).json({ error: 'Pet not found.' });
        return;
      }
      if (req.user.role !== 'admin' && pet.lister_id !== req.user.userId) {
        res.status(403).json({ error: 'Only the pet lister or an admin can update this listing.' });
        return;
      }
      const status = String(req.body.status || '').toUpperCase();
      if (!['AVAILABLE', 'PENDING', 'ADOPTED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status.' });
        return;
      }
      await FurEverModel.updatePetStatus(pet.id, status as 'AVAILABLE' | 'PENDING' | 'ADOPTED');
      res.json({ ok: true, status });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update pet status: ' + (err as Error).message });
    }
  },

  async deletePet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }
      const pet = await FurEverModel.getPetById(String(req.params.id));
      if (!pet) {
        res.status(404).json({ error: 'Pet not found.' });
        return;
      }
      if (req.user.role !== 'admin' && pet.lister_id !== req.user.userId) {
        res.status(403).json({ error: 'Only the pet lister or an admin can delete this listing.' });
        return;
      }
      await FurEverModel.deletePet(pet.id);
      if (req.user.role === 'admin') {
        await FurEverModel.logAdminActivity({
          id: `act-${Date.now()}`,
          admin_id: req.user.userId,
          action_type: 'DELETE_PET',
          target_table: 'pets',
          target_id: pet.id,
          summary: `Removed pet listing "${pet.name}" (${pet.breed})`,
          created_at: new Date().toISOString(),
        });
      }
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete pet: ' + (err as Error).message });
    }
  },
};
