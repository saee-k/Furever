export type PageTab =
  | 'home'
  | 'browse'
  | 'swipe'
  | 'quiz'
  | 'list-pet'
  | 'lost-found'
  | 'vets'
  | 'status'
  | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'adopter' | 'lister' | 'admin';
  phone: string;
  city: string;
  housing_type: string;
  bio: string;
  avatar_url?: string | null;
  is_active: number;
  created_at: string;
}

export interface PetImage {
  id: string;
  pet_id: string;
  image_url: string;
  caption: string;
  is_primary: number;
  sort_order: number;
}

export interface Pet {
  id: string;
  lister_id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Rabbit' | 'Bird' | 'Other';
  breed: string;
  age_label: string;
  age_category: 'Young' | 'Adult' | 'Senior';
  gender: 'Male' | 'Female';
  weight: string;
  activity_level: 'Low' | 'Moderate' | 'High';
  location: string;
  shelter_name: string;
  adoption_fee: string;
  description: string;
  personality_json: string[];
  good_with_json: string[];
  vaccinated: number;
  spayed_neutered: number;
  microchipped: number;
  health_notes: string;
  adoption_requirements: string;
  status: 'AVAILABLE' | 'PENDING' | 'ADOPTED';
  is_featured: number;
  primary_image_url: string;
  created_at: string;
  images?: PetImage[];
  lister?: Partial<User> | null;
}

export interface AdoptionApplication {
  id: string;
  pet_id: string;
  applicant_id: string;
  lister_id: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  city: string;
  housing_type: string;
  has_yard: number;
  pet_experience: string;
  household_members: string;
  daily_alone_hours: string;
  fit_reason: string;
  eligibility_result: 'APPLICABLE' | 'NOT_APPLICABLE';
  eligibility_reason: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Withdrawn';
  reviewer_notes: string;
  created_at: string;
  pet_name?: string;
  pet_image?: string;
  pet_breed?: string;
}

export interface QuizRecommendation {
  pet: Pet;
  matchScore: number;
  matchReasons: string[];
}

export interface LostFoundReport {
  id: string;
  reporter_id: string | null;
  report_type: 'lost' | 'found';
  pet_name: string;
  species: 'Dog' | 'Cat' | 'Rabbit' | 'Bird' | 'Other';
  breed: string;
  color_markings: string;
  last_seen_location: string;
  report_date: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  photo_url: string | null;
  status: 'Open' | 'Reunited' | 'Closed';
  created_at: string;
}

export interface VetClinic {
  id: string;
  clinic_name: string;
  vet_name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  services_json: string[];
  emergency_24_7: number;
  rating: number;
  is_verified: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

export interface SwipeHistoryItem {
  id: string;
  pet_id: string;
  action: 'like' | 'pass';
  pet_name: string;
  species: string;
  breed: string;
  primary_image_url: string;
  location: string;
  created_at: string;
}

export interface PublicStats {
  totalPets: number;
  availablePets: number;
  adoptedPets: number;
  totalVets: number;
}

export interface AdminDashboardData {
  stats: {
    totalPets: number;
    availablePets: number;
    adoptedPets: number;
    totalUsers: number;
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    totalLostFound: number;
    openLostFound: number;
    reunitedLostFound: number;
    totalVets: number;
  };
  users: User[];
  pets: Pet[];
  applications: AdoptionApplication[];
  lostFound: LostFoundReport[];
  vets: VetClinic[];
}
