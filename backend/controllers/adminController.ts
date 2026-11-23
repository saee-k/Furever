import { Response } from 'express';
import { FurEverModel } from '../models/fureverModel';
import { AuthenticatedRequest } from '../middleware/auth';

export const AdminController = {
  async getDashboard(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [stats, users, pets, applications, lostFound, vets] = await Promise.all([
        FurEverModel.getPlatformStats(),
        FurEverModel.listAllUsers(),
        FurEverModel.listPets(),
        FurEverModel.listApplications(),
        FurEverModel.listLostFound(),
        FurEverModel.listVets(),
      ]);
      res.json({ stats, users, pets, applications, lostFound, vets });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load admin overview: ' + (err as Error).message });
    }
  },

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetId = String(req.params.id);
      const { role, is_active } = req.body;
      const updates: { role?: 'adopter' | 'lister' | 'admin'; is_active?: number } = {};
      if (role && ['adopter', 'lister', 'admin'].includes(role)) updates.role = role;
      if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;

      const updated = await FurEverModel.updateUserProfile(targetId, updates);
      if (!updated) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      if (req.user) {
        await FurEverModel.logAdminActivity({
          id: `act-${Date.now()}`,
          admin_id: req.user.userId,
          action_type: 'UPDATE_USER',
          target_table: 'users',
          target_id: targetId,
          summary: `Updated user ${updated.full_name} (${JSON.stringify(updates)})`,
          created_at: new Date().toISOString(),
        });
      }

      const { password_hash: _pw, ...safeUser } = updated;
      res.json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user: ' + (err as Error).message });
    }
  },

  async deleteVet(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params.id);
    const deleted = await FurEverModel.deleteVetClinic(id);
    if (!deleted) {
      res.status(404).json({ error: 'Clinic not found.' });
      return;
    }
    if (req.user) {
      await FurEverModel.logAdminActivity({
        id: `act-${Date.now()}`,
        admin_id: req.user.userId,
        action_type: 'DELETE_VET',
        target_table: 'veterinary_clinics',
        target_id: id,
        summary: `Deleted veterinary clinic ${id}`,
        created_at: new Date().toISOString(),
      });
    }
    res.json({ ok: true });
  },
};
