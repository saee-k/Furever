# FurEver — Student Project & Viva Explanation Guide

This guide explains how **FurEver** works in plain, easy-to-follow terms so you can confidently present and defend every part of the project during a college demonstration or viva.

---

## 1. High-Level Architecture (How Everything Connects)

FurEver follows a standard **3-tier full-stack web architecture**:

```text
[ React Frontend (Browser) ]
        │   fetch('/api/...') with JSON or FormData + JWT Header
        ▼
[ Express.js Backend (Node.js) ]
        │   Routes -> Auth Middleware -> Controllers -> Model Layer
        ▼
[ MySQL Database (mysql2) ]
        └── 11 Normalized Relational Tables (or local JSON fallback if MySQL is offline)
```

1. **Presentation Layer (React + Vite + Tailwind CSS)**: Renders pages (`HomePage`, `BrowsePage`, `SwipePage`, `QuizPage`, etc.) and handles user clicks, filters, and form inputs in the browser without reloading the page.
2. **Application / API Layer (Node.js + Express)**: Listens on port `3000`, validates incoming requests, checks user login tokens (JWT), processes business logic (like quiz scoring and eligibility checks), and handles photo uploads (`multer`).
3. **Data Layer (MySQL via `mysql2`)**: Stores users, pets, images, favourites, swipe history, applications, quiz responses, lost/found reports, vet clinics, and notifications across normalized tables.

---

## 2. Step-by-Step Request Flow (Frontend ↔ Backend ↔ Database)

Let’s trace two common actions from start to finish:

### Example A: Browsing & Filtering Pets
1. When the app opens, `useEffect` in `src/App.tsx` calls `api.listPets()` from `src/services/api.ts`.
2. `api.listPets()` sends `GET /api/pets` using the browser's `fetch()` API.
3. Express routes the request in `backend/routes/apiRouter.ts` to `PetController.listPets`.
4. `PetController.listPets` calls `FurEverModel.listPets()` in `backend/models/fureverModel.ts`, which executes a `SELECT` query on the `pets` table.
5. Express responds with `{ pets: [...] }` in JSON format.
6. React stores the list in `useState` (`setPets`) and passes it down to `BrowsePage.tsx`, which filters the cards instantly as you type or pick species/age filters.

### Example B: Submitting an Adoption Application
1. User clicks **Apply to Adopt** inside `PetDetailsModal` (`src/components/Modals.tsx`).
2. `ApplicationModal` collects living arrangement, experience, alone hours, and a minimum 20-word explanation (`fitReason`).
3. Submitting calls `api.submitApplication(payload)`, which sends `POST /api/applications` along with `Authorization: Bearer <JWT_TOKEN>`.
4. `requireAuth` middleware (`backend/middleware/auth.ts`) verifies the JWT and attaches `req.user` (`userId`, `role`).
5. `ApplicationController.submitApplication` checks minimum word count and evaluates home suitability (`APPLICABLE` or `NOT_APPLICABLE`).
6. `FurEverModel.createApplication()` inserts a row into `adoption_applications` and inserts a notification into `notifications`.
7. React refreshes user data (`loadUserDashboardData`) and switches to the **Status** dashboard where the new application appears immediately.

---

## 3. Important Files & What Each One Does

| File Path | Role & Key Functions |
| --- | --- |
| `server.ts` | Entry point: calls `initDatabase()`, sets up JSON parsing, mounts `/uploads` & `/api`, runs Vite in dev mode. |
| `backend/config/db.ts` | `initDatabase()`, `getMysqlPool()` — creates the `mysql2/promise` connection pool from `.env`; falls back gracefully if MySQL isn't running locally. |
| `backend/routes/apiRouter.ts` | Defines all REST URLs (`/auth/*`, `/pets/*`, `/swipes`, `/quiz/recommend`, `/applications`, `/lost-found`, `/vets`, `/admin/*`) and configures `multer` image uploads. |
| `backend/middleware/auth.ts` | `requireAuth`, `optionalAuth`, `requireRole` — decodes JWT tokens and blocks unauthorized users from protected routes. |
| `backend/controllers/interactionController.ts` | `toggleFavorite`, `recordSwipe`, and `submitQuiz` (scores pets out of 99 based on species, home space, energy, time, experience, and age). |
| `backend/models/fureverModel.ts` | Contains all SQL read/write queries (`listPets`, `getPetById`, `createApplication`, `updateApplicationStatus`, etc.). |
| `database/schema.sql` | Creates the `furever_db` database and all 11 relational tables with `PRIMARY KEY`, `FOREIGN KEY`, and `INDEX` definitions. |
| `src/App.tsx` | Central React controller holding `user`, `pets`, `favouriteIds`, `applications`, and modal states (`selectedPet`, `applyingPet`, `showAuthModal`). |
| `src/services/api.ts` | `apiRequest()` helper that attaches JWT tokens and wraps every Express API endpoint into clean TypeScript functions. |

---

## 4. Sample SQL Queries Used in the Project

When connected to MySQL, operations map directly to clean SQL queries:

```sql
-- 1. Fetch all available pets ordered by featured status
SELECT * FROM pets
WHERE status = 'AVAILABLE'
ORDER BY is_featured DESC, created_at DESC;

-- 2. Join pet details with the shelter/lister user
SELECT p.*, u.full_name AS lister_name, u.email AS lister_email
FROM pets p
JOIN users u ON p.lister_id = u.id
WHERE p.id = ?;

-- 3. Insert or update a Swipe Match decision
INSERT INTO swipe_history (id, user_id, pet_id, action)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE action = VALUES(action);

-- 4. Update adoption application status
UPDATE adoption_applications
SET status = ?, reviewer_notes = ?
WHERE id = ?;
```

---

## 5. Common Viva Questions & Simple Answers

**Q1: Why did you choose a relational database (MySQL) for FurEver?**  
**Answer:** Pet adoption involves strongly connected entities—a `user` owns `pets`, submits `adoption_applications` for a specific `pet_id`, and saves `favourites`. Using MySQL foreign keys (`ON DELETE CASCADE`) guarantees data consistency and prevents orphaned applications or favourites.

**Q2: How is user authentication secured?**  
**Answer:** Passwords are never stored in plain text. During registration (`AuthController.register`), `bcryptjs` hashes the password before saving it to `users.password_hash`. On login, a signed **JWT (JSON Web Token)** is issued and checked on protected routes via `requireAuth` middleware.

**Q3: How does the Match Quiz algorithm work?**  
**Answer:** In `InteractionController.submitQuiz`, each available pet starts at a base score of `50`. We add or adjust points by comparing the user's 6 answers (`preferredSpecies`, `livingSpace`, `dailyAvailability`, `activityLevel`, `petExperience`, `preferredAge`) against the pet's attributes (`species`, `activity_level`, `age_category`, `good_with_json`), attach human-readable match reasons, and return the top 6 ranked pets.

**Q4: How do image uploads work when listing a pet or reporting a lost pet?**  
**Answer:** The React form uses `FormData` (multipart/form-data) instead of JSON when a file is chosen. On the backend, **Multer** (`backend/routes/apiRouter.ts`) validates that the file is an image under 5 MB, saves it inside `public/uploads/`, and stores the `/uploads/<filename>` path in the database.

**Q5: Why is there a local JSON store fallback inside `backend/config/db.ts`?**  
**Answer:** In demo or sandbox environments where a MySQL daemon is not running, `initDatabase()` detects the failed connection and seamlessly switches to `localStore.ts` (`data/furever-db.json`) so the professor or evaluator can test every feature immediately without setup friction, while still using `mysql2` as soon as MySQL credentials are configured in `.env`.
