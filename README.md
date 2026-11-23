# FurEver — Pet Adoption & Matching Platform

## 1. Project Overview
**FurEver** is a full-stack web application built to simplify and modernize ethical pet adoption. Designed as a clean, welcoming second-year B.Tech Computer Engineering student project, it connects prospective pet adopters, verified animal shelters/listers, and local veterinarians on a single platform.

Instead of browsing scattered social media posts or unverified listings, users can filter available pets, match interactively via a card-swipe interface, complete a 6-step lifestyle compatibility quiz, submit adoption applications with automated eligibility feedback, report lost or found pets, find 24/7 veterinary clinics, and track application statuses in real time.

---

## 2. Problem Statement
Traditional pet adoption and rescue coordination often suffers from:
- Disconnected shelter spreadsheets and unstructured social media listings.
- High mismatch rates when adopters choose pets without evaluating home space, daily schedule, and experience.
- Lack of transparency around application review progress after submitting an adoption inquiry.
- Fragmented community channels for lost-and-found pet alerts and verified veterinary contacts.

---

## 3. Objectives
- Build an intuitive, minimal, static-background React interface that keeps the focus on pet profiles and adoption workflows.
- Implement a structured **Express.js REST API** separating routing, authentication middleware, controllers, and database access.
- Design a **normalized MySQL relational database** (`mysql2/promise`) with proper foreign keys, constraints, and indexes.
- Provide lifestyle-driven matching (**Swipe Match** and **6-Step Match Quiz**) alongside end-to-end **Adoption Application Tracking** and an **Admin Management Console**.

---

## 4. Technology Stack
| Layer | Technologies Used |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React (`lucide-react`) |
| **Backend** | Node.js, Express.js (`express`), Multer (`multer` for image uploads) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & password hashing (`bcryptjs`) |
| **Database** | MySQL 8+ via `mysql2/promise` (with automatic local JSON relational fallback for sandbox environments) |
| **Typography** | Poppins (headings) & Inter (body text) |

---

## 5. System Architecture

### Frontend (`src/`)
Built as a modular React Single Page Application (SPA) bundled by Vite:
- **`src/main.tsx` & `src/App.tsx`**: Entry point, shared application state, tab navigation, and modal orchestration.
- **`src/services/api.ts`**: Centralized `fetch` API client that attaches JWT Bearer tokens automatically.
- **`src/components/`**: Reusable UI pieces (`Navbar.tsx`, `Footer.tsx`, `PetCard.tsx`, `Modals.tsx`).
- **`src/pages/`**: Dedicated page views (`HomePage.tsx`, `BrowsePage.tsx`, `SwipePage.tsx`, `QuizPage.tsx`, `ListPetPage.tsx`, `LostFoundPage.tsx`, `VetsPage.tsx`, `StatusDashboardPage.tsx`, `AdminPage.tsx`).

### Backend (`server.ts` & `backend/`)
Structured using a clear MVC-style layout:
- **`server.ts`**: Initializes the database, mounts `/uploads` static file serving, attaches `/api` routes, and integrates Vite dev middleware (or `dist/` static build in production).
- **`backend/routes/apiRouter.ts`**: Maps RESTful endpoints and configures `multer` image uploads.
- **`backend/middleware/auth.ts`**: Verifies JWT tokens (`requireAuth`, `optionalAuth`) and enforces role permissions (`requireRole`).
- **`backend/controllers/`**: Handles request validation and business logic (`authController.ts`, `petController.ts`, `interactionController.ts`, `applicationController.ts`, `communityController.ts`, `adminController.ts`).
- **`backend/models/fureverModel.ts`**: Data access layer executing SQL queries against `mysql2` (or local store fallback when no MySQL server is running).

---

## 6. Database Architecture (`database/schema.sql`)
The database **`furever_db`** uses **11 normalized InnoDB tables** linked with foreign keys and `ON DELETE CASCADE` / `SET NULL` rules:
1. `users` — Stores adopters, shelter listers, and administrators with hashed passwords (`bcryptjs`).
2. `pets` — Stores pet profiles, breed, species, age, activity level, health flags, and availability status.
3. `pet_images` — Stores multi-photo galleries linked to each pet (`pet_id` → `pets.id`).
4. `favourites` — Many-to-many saved pets per user with unique constraint `(user_id, pet_id)`.
5. `swipe_history` — Tracks `like` / `pass` decisions per user and pet.
6. `adoption_applications` — Stores submitted adopter home details, fit reasoning, eligibility evaluation, and review status.
7. `quiz_responses` — Persists user lifestyle quiz answers and recommended pet IDs.
8. `lost_found_reports` — Tracks missing or found animal alerts and reunion status.
9. `veterinary_clinics` — Directory of verified veterinary clinics and 24/7 emergency hospitals.
10. `notifications` — User notifications triggered on application status changes.
11. `admin_activity` — Audit trail of administrative actions.

---

## 7. Core Application Modules
1. **Home & Featured Pets**: Clean two-column landing layout highlighting featured companion Bobi, 4-step adoption workflow, live platform statistics, and testimonials.
2. **Browse Pets**: Real-time search bar, species filter tabs, age/gender/neighbourhood filters, and sorting.
3. **Pet Details Modal**: Multi-photo gallery switcher, vaccination/spay/microchip record, adoption requirements, shelter email link, and Apply trigger.
4. **Swipe Match**: Single-card discovery stack with Like, Pass, Undo, species filter, and saved-matches counter.
5. **Match Quiz**: 6-step lifestyle questionnaire scored on the Express backend to rank compatible companions.
6. **List a Pet**: Authenticated shelter/owner form supporting local photo upload (`multer`) or image URL.
7. **Lost & Found**: Community alert board to post lost/found animals with photos and mark pets as `Reunited`.
8. **Veterinary Directory**: Searchable clinic directory with 24/7 emergency filtering.
9. **Account & Status Dashboard**: Profile editor, saved favourites, application status tracker (withdraw/review), listed pets manager, swipe history, and notifications.
10. **Admin Console**: Platform-wide metrics plus management tabs for Applications, Pets, Users, Lost & Found reports, and Veterinary Clinics.

---

## 8. API Endpoints Summary (`/api`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Server health, DB engine status, and platform counts |
| `POST` | `/api/auth/register` | Public | Register a new adopter or shelter account |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT + favourites |
| `POST` | `/api/auth/logout` | Public | Clear session cookie |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user, favourites, and notifications |
| `PUT` | `/api/users/profile` | Authenticated | Update user profile details |
| `GET` | `/api/pets` | Public | List pets with optional query filters |
| `GET` | `/api/pets/:id` | Public | Fetch full pet details, images, and lister info |
| `POST` | `/api/pets` | Authenticated | Create a new pet listing (with optional `photo` upload) |
| `PATCH` | `/api/pets/:id/status` | Owner / Admin | Update pet status (`AVAILABLE`, `PENDING`, `ADOPTED`) |
| `DELETE` | `/api/pets/:id` | Owner / Admin | Delete a pet listing |
| `GET` | `/api/favorites` | Authenticated | Get user's saved pet IDs |
| `POST` | `/api/favorites/toggle` | Authenticated | Add or remove a pet from favourites |
| `POST` | `/api/swipes` | Authenticated | Record `like` or `pass` swipe decision |
| `GET` | `/api/swipes/history` | Authenticated | Fetch user's swipe history |
| `POST` | `/api/quiz/recommend` | Optional Auth | Score available pets against 6 lifestyle answers |
| `GET` | `/api/applications` | Authenticated | List user's applications (or incoming shelter applications) |
| `POST` | `/api/applications` | Authenticated | Submit adoption application + run eligibility check |
| `PATCH` | `/api/applications/:id/status` | Applicant / Lister / Admin | Withdraw, approve, reject, or review application |
| `GET` | `/api/lost-found` | Public | List all lost and found reports |
| `POST` | `/api/lost-found` | Optional Auth | Create lost/found report with optional photo |
| `PATCH` | `/api/lost-found/:id/status` | Reporter / Admin | Mark report as `Open`, `Reunited`, or `Closed` |
| `GET` | `/api/vets` | Public | List verified veterinary clinics |
| `POST` | `/api/vets` | Admin | Add a new veterinary clinic |
| `GET` | `/api/notifications` | Authenticated | List user notifications |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |
| `GET` | `/api/admin/dashboard` | Admin | Retrieve aggregate counts and full admin tables |
| `PATCH` | `/api/admin/users/:id` | Admin | Activate/deactivate users or update roles |
| `DELETE` | `/api/admin/vets/:id` | Admin | Remove a veterinary clinic |

---

## 9. Project Folder Structure
```text
├── backend/
│   ├── config/
│   │   ├── db.ts                  # MySQL2 connection pool + fallback initializer
│   │   └── localStore.ts          # Persistent local JSON relational fallback
│   ├── controllers/               # Request handlers (auth, pets, quiz, applications, community, admin)
│   ├── middleware/
│   │   └── auth.ts                # JWT verification & role guard middleware
│   ├── models/
│   │   └── fureverModel.ts        # Database queries & data persistence layer
│   └── routes/
│       └── apiRouter.ts           # Express API routes & Multer file upload setup
├── database/
│   ├── schema.sql                 # Normalized 11-table MySQL schema
│   └── seed.sql                   # Sample users, pets, vets, and reports
├── public/
│   ├── favicon.svg
│   ├── pets/                      # Static pet photography
│   └── uploads/                   # User-uploaded photos
├── src/
│   ├── assets/images/             # Bundled featured pet images
│   ├── components/                # Navbar, Footer, PetCard, Modals
│   ├── pages/                     # Home, Browse, Swipe, Quiz, ListPet, LostFound, Vets, Status, Admin
│   ├── services/
│   │   └── api.ts                 # Frontend fetch wrapper
│   ├── App.tsx                    # Root React component
│   ├── index.css                  # Tailwind CSS v4 + design tokens
│   ├── main.tsx                   # React DOM mount
│   └── types.ts                   # Shared TypeScript interfaces
├── index.html
├── package.json
└── server.ts                      # Express + Vite server entry point
```

---

## 10. Environment Configuration (`.env`)
Copy `.env.example` to `.env` and fill in your local MySQL credentials when running with a live MySQL instance:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=furever_db
JWT_SECRET=replace_with_a_strong_secret
```
> **Note:** If MySQL is not running in the environment, `backend/config/db.ts` automatically falls back to `data/furever-db.json` via `localStore.ts` so every feature remains functional out of the box.

---

## 11. MySQL Database Setup
Run the SQL schema and sample seed scripts in MySQL Workbench or the MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

## 12. Installation & Running Locally
```bash
# 1. Install all dependencies
npm install

# 2. Start development server (Express API + Vite React frontend on port 3000)
npm run dev

# 3. Type-check and build for production
npm run lint
npm run build

# 4. Run production server
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 13. Demo Login Credentials
All pre-seeded accounts use the password **`furever123`**:

| Role | Email | Password | Capabilities |
| --- | --- | --- | --- |
| **Adopter** | `adopter@furever.com` | `furever123` | Browse, swipe, save favourites, submit & track applications |
| **Shelter / Lister** | `shelter@furever.com` | `furever123` | List pets, update adoption availability, review incoming applications |
| **Administrator** | `admin@furever.com` | `furever123` | Access Admin Console, manage users, applications, pets, reports & vets |

---

## 14. Future Enhancements
- Email/SMS reminders for scheduled shelter meet-and-greets.
- Map integration for pinpointing lost-and-found sightings and nearby clinics.
- Automated image compression and cloud object storage for uploaded pet photos.
