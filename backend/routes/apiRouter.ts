import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth';
import { AuthController } from '../controllers/authController';
import { PetController } from '../controllers/petController';
import { InteractionController } from '../controllers/interactionController';
import { ApplicationController } from '../controllers/applicationController';
import { CommunityController } from '../controllers/communityController';
import { AdminController } from '../controllers/adminController';
import { FurEverModel } from '../models/fureverModel';
import { isMysqlConnected } from '../config/db';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `furever-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

const router = express.Router();

// Health & Public Stats
router.get('/health', async (_req, res) => {
  const stats = await FurEverModel.getPlatformStats();
  res.json({
    status: 'ok',
    databaseEngine: isMysqlConnected() ? 'mysql' : 'local-relational',
    stats: {
      totalPets: stats.totalPets,
      availablePets: stats.availablePets,
      adoptedPets: stats.adoptedPets,
      totalVets: stats.totalVets,
    },
  });
});

// Authentication & Users
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/me', requireAuth, AuthController.me);
router.put('/users/profile', requireAuth, AuthController.updateProfile);

// Pets
router.get('/pets', PetController.listPets);
router.get('/pets/:id', PetController.getPet);
router.post('/pets', requireAuth, upload.single('photo'), PetController.createPet);
router.patch('/pets/:id/status', requireAuth, PetController.updatePetStatus);
router.delete('/pets/:id', requireAuth, PetController.deletePet);

// Favorites, Swipe Match & Quiz
router.get('/favorites', requireAuth, InteractionController.getFavorites);
router.post('/favorites/toggle', requireAuth, InteractionController.toggleFavorite);
router.post('/swipes', requireAuth, InteractionController.recordSwipe);
router.get('/swipes/history', requireAuth, InteractionController.getSwipeHistory);
router.post('/quiz/recommend', optionalAuth, InteractionController.submitQuiz);

// Adoption Applications
router.get('/applications', requireAuth, ApplicationController.listApplications);
router.post('/applications', requireAuth, ApplicationController.submitApplication);
router.patch('/applications/:id/status', requireAuth, ApplicationController.updateStatus);

// Lost & Found
router.get('/lost-found', CommunityController.listLostFound);
router.post('/lost-found', optionalAuth, upload.single('photo'), CommunityController.createLostFound);
router.patch('/lost-found/:id/status', requireAuth, CommunityController.updateLostFoundStatus);

// Veterinary Clinics
router.get('/vets', CommunityController.listVets);
router.post('/vets', requireAuth, requireRole('admin'), CommunityController.createVet);

// Notifications
router.get('/notifications', requireAuth, CommunityController.listNotifications);
router.patch('/notifications/:id/read', requireAuth, CommunityController.markNotificationRead);

// Admin Operations
router.get('/admin/dashboard', requireAuth, requireRole('admin'), AdminController.getDashboard);
router.patch('/admin/users/:id', requireAuth, requireRole('admin'), AdminController.updateUser);
router.delete('/admin/vets/:id', requireAuth, requireRole('admin'), AdminController.deleteVet);

export default router;
