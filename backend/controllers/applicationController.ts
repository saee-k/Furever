import { Response } from 'express';
import { FurEverModel } from '../models/fureverModel';
import { AuthenticatedRequest } from '../middleware/auth';
import { PetRow } from '../config/localStore';

function evaluateEligibility(
  fitReason: string,
  housingType: string,
  petExperience: string,
  pet: PetRow
): { result: 'APPLICABLE' | 'NOT_APPLICABLE'; reason: string } {
  const words = fitReason.trim().split(/\s+/).filter(Boolean).length;
  if (words < 20) {
    return {
      result: 'NOT_APPLICABLE',
      reason: 'Please share at least 20 words about your home environment and why you would be a great fit.',
    };
  }

  const requiresYard = pet.good_with_json.some((g) =>
    ['Yard Homes', 'Fenced Yard', 'Farm Life', 'Spacious Homes'].includes(g)
  );
  if (pet.activity_level === 'High' && requiresYard && housingType === 'Apartment') {
    return {
      result: 'NOT_APPLICABLE',
      reason: `${pet.name} has high energy and thrives best in a home with yard or spacious outdoor access.`,
    };
  }

  const requiresExperienced =
    pet.good_with_json.some((g) => ['Experienced Owners', 'Experienced Handlers'].includes(g)) ||
    pet.personality_json.some((p) => ['Protective', 'Alert'].includes(p));
  if (requiresExperienced && petExperience === 'First-time adopter') {
    return {
      result: 'NOT_APPLICABLE',
      reason: `${pet.name} requires an adopter with prior experience handling companion animals.`,
    };
  }

  return {
    result: 'APPLICABLE',
    reason: 'Your household profile meets all eligibility requirements for this pet!',
  };
}

export const ApplicationController = {
  async listApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Sign in required to view adoption applications.' });
      return;
    }

    let apps;
    if (req.user.role === 'admin') {
      apps = await FurEverModel.listApplications();
    } else if (req.user.role === 'lister') {
      apps = await FurEverModel.listApplications({ listerId: req.user.userId });
    } else {
      apps = await FurEverModel.listApplications({ applicantId: req.user.userId });
    }
    res.json({ applications: apps });
  },

  async submitApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Please sign in to submit an adoption application.' });
        return;
      }

      const {
        petId,
        applicantName,
        applicantEmail,
        applicantPhone,
        city,
        housingType,
        hasYard,
        petExperience,
        householdMembers,
        dailyAloneHours,
        fitReason,
      } = req.body;

      if (!petId || !applicantName || !applicantEmail || !applicantPhone || !city || !housingType || !fitReason) {
        res.status(400).json({ error: 'Please complete all required application fields.' });
        return;
      }

      const pet = await FurEverModel.getPetById(String(petId));
      if (!pet) {
        res.status(404).json({ error: 'Selected pet was not found.' });
        return;
      }
      if (pet.status === 'ADOPTED') {
        res.status(400).json({ error: `${pet.name} has already been adopted.` });
        return;
      }

      const eligibility = evaluateEligibility(
        String(fitReason),
        String(housingType),
        String(petExperience || 'First-time adopter'),
        pet
      );

      const now = new Date().toISOString();
      const created = await FurEverModel.createApplication({
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        pet_id: pet.id,
        applicant_id: req.user.userId,
        lister_id: pet.lister_id,
        applicant_name: String(applicantName).trim(),
        applicant_email: String(applicantEmail).trim(),
        applicant_phone: String(applicantPhone).trim(),
        city: String(city).trim(),
        housing_type: String(housingType).trim(),
        has_yard: hasYard ? 1 : 0,
        pet_experience: String(petExperience || 'First-time adopter'),
        household_members: String(householdMembers || 'Adults only'),
        daily_alone_hours: String(dailyAloneHours || '2-4 hours'),
        fit_reason: String(fitReason).trim(),
        eligibility_result: eligibility.result,
        eligibility_reason: eligibility.reason,
        status: eligibility.result === 'APPLICABLE' ? 'Pending' : 'Under Review',
        reviewer_notes: '',
        created_at: now,
        updated_at: now,
      });

      if (pet.lister_id) {
        await FurEverModel.createNotification({
          id: `notif-${Date.now()}-1`,
          user_id: pet.lister_id,
          title: `New Adoption Inquiry for ${pet.name}`,
          message: `${applicantName} applied to adopt ${pet.name} (${eligibility.result === 'APPLICABLE' ? 'Eligibility Verified' : 'Needs Review'}).`,
          type: 'application',
          is_read: 0,
          created_at: now,
        });
      }

      res.status(201).json({ application: created, eligibility });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit application: ' + (err as Error).message });
    }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }
      const appId = String(req.params.id);
      const { status, reviewerNotes } = req.body;
      const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Withdrawn'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status value.' });
        return;
      }

      const allApps = await FurEverModel.listApplications();
      const target = allApps.find((a) => a.id === appId);
      if (!target) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }

      if (status === 'Withdrawn') {
        if (req.user.role !== 'admin' && target.applicant_id !== req.user.userId) {
          res.status(403).json({ error: 'Only the applicant can withdraw this application.' });
          return;
        }
      } else {
        if (req.user.role !== 'admin' && target.lister_id !== req.user.userId) {
          res.status(403).json({ error: 'Only the shelter/lister or admin can review this application.' });
          return;
        }
      }

      const updated = await FurEverModel.updateApplicationStatus(appId, status, reviewerNotes);
      if (updated) {
        await FurEverModel.createNotification({
          id: `notif-${Date.now()}`,
          user_id: updated.applicant_id,
          title: `Application Status: ${status}`,
          message: `Your adoption application for ${target.pet_name || 'your pet'} is now "${status}".`,
          type: 'application',
          is_read: 0,
          created_at: new Date().toISOString(),
        });

        if (req.user.role === 'admin') {
          await FurEverModel.logAdminActivity({
            id: `act-${Date.now()}`,
            admin_id: req.user.userId,
            action_type: `APPLICATION_${status.toUpperCase()}`,
            target_table: 'adoption_applications',
            target_id: appId,
            summary: `Updated application ${appId} to ${status}`,
            created_at: new Date().toISOString(),
          });
        }
      }

      res.json({ application: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update application: ' + (err as Error).message });
    }
  },
};
