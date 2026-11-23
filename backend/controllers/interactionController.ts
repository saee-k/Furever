import { Response } from 'express';
import { FurEverModel } from '../models/fureverModel';
import { AuthenticatedRequest } from '../middleware/auth';

export const InteractionController = {
  async getFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Sign in required.' });
      return;
    }
    const petIds = await FurEverModel.getUserFavouriteIds(req.user.userId);
    res.json({ petIds });
  },

  async toggleFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Please sign in to save favourites.' });
      return;
    }
    const { petId } = req.body;
    if (!petId) {
      res.status(400).json({ error: 'petId is required.' });
      return;
    }
    const result = await FurEverModel.toggleFavourite(req.user.userId, String(petId));
    res.json(result);
  },

  async recordSwipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Please sign in to save swipe matches.' });
      return;
    }
    const { petId, action } = req.body;
    if (!petId || !['like', 'pass'].includes(action)) {
      res.status(400).json({ error: 'Valid petId and action (like|pass) required.' });
      return;
    }
    await FurEverModel.recordSwipe(req.user.userId, String(petId), action);
    const petIds = await FurEverModel.getUserFavouriteIds(req.user.userId);
    res.json({ ok: true, petIds });
  },

  async getSwipeHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const history = await FurEverModel.getSwipeHistory(req.user.userId);
    res.json({ history });
  },

  async submitQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        preferredSpecies = 'Any',
        livingSpace = 'Apartment',
        dailyAvailability = '2-4 hours',
        activityLevel = 'Moderate',
        petExperience = 'First-time',
        preferredAge = 'Any',
      } = req.body;

      const allPets = await FurEverModel.listPets({ status: 'AVAILABLE' });

      const scored = allPets
        .map((pet) => {
          let score = 50;
          const reasons: string[] = [];

          // 1. Species preference
          if (preferredSpecies === 'Any' || pet.species.toLowerCase() === String(preferredSpecies).toLowerCase()) {
            score += 22;
            reasons.push(`Matches your ${preferredSpecies === 'Any' ? 'open companion' : preferredSpecies} preference`);
          } else {
            score -= 18;
          }

          // 2. Living space compatibility
          const goodWith = pet.good_with_json.map((g) => g.toLowerCase());
          if (livingSpace === 'Apartment') {
            if (goodWith.some((g) => g.includes('apartment') || g.includes('indoor') || g.includes('quiet'))) {
              score += 12;
              reasons.push('Thrives happily in apartment homes');
            } else if (pet.activity_level === 'High') {
              score -= 8;
            }
          } else if (livingSpace === 'House with Yard') {
            score += 10;
            reasons.push('Great fit for a home with outdoor space');
          }

          // 3. Activity level
          if (pet.activity_level.toLowerCase() === String(activityLevel).toLowerCase()) {
            score += 12;
            reasons.push(`${pet.activity_level} energy fits your daily routine`);
          } else if (
            (activityLevel === 'Low' && pet.activity_level === 'Moderate') ||
            (activityLevel === 'High' && pet.activity_level === 'Moderate')
          ) {
            score += 5;
          }

          // 4. Daily availability
          if (dailyAvailability === '1-2 hours' && pet.activity_level === 'Low') {
            score += 8;
            reasons.push('Independent and comfortable with calm schedules');
          } else if (dailyAvailability === '4+ hours') {
            score += 6;
            reasons.push('Loves generous companionship time');
          }

          // 5. Experience
          if (petExperience === 'First-time' && goodWith.some((g) => g.includes('first-time'))) {
            score += 8;
            reasons.push('Welcoming for first-time pet parents');
          } else if (petExperience === 'Experienced') {
            score += 4;
          }

          // 6. Age preference
          if (preferredAge === 'Any' || pet.age_category.toLowerCase() === String(preferredAge).toLowerCase()) {
            score += 8;
            if (preferredAge !== 'Any') reasons.push(`${pet.age_category} age group match`);
          }

          const clamped = Math.max(45, Math.min(99, score));
          return {
            pet,
            matchScore: clamped,
            matchReasons: reasons.slice(0, 3),
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);

      await FurEverModel.saveQuizResponse({
        id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: req.user?.userId || null,
        preferred_species: String(preferredSpecies),
        living_space: String(livingSpace),
        daily_availability: String(dailyAvailability),
        activity_level: String(activityLevel),
        pet_experience: String(petExperience),
        preferred_age: String(preferredAge),
        recommended_pet_ids_json: scored.map((s) => s.pet.id),
        created_at: new Date().toISOString(),
      });

      res.json({ recommendations: scored });
    } catch (err) {
      res.status(500).json({ error: 'Quiz recommendation failed: ' + (err as Error).message });
    }
  },
};
