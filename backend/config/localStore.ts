import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: 'adopter' | 'lister' | 'admin';
  phone: string;
  city: string;
  housing_type: string;
  bio: string;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
}

export interface PetRow {
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
}

export interface PetImageRow {
  id: string;
  pet_id: string;
  image_url: string;
  caption: string;
  is_primary: number;
  sort_order: number;
  created_at: string;
}

export interface FavouriteRow {
  id: string;
  user_id: string;
  pet_id: string;
  created_at: string;
}

export interface SwipeHistoryRow {
  id: string;
  user_id: string;
  pet_id: string;
  action: 'like' | 'pass';
  created_at: string;
}

export interface ApplicationRow {
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
  updated_at: string;
}

export interface QuizResponseRow {
  id: string;
  user_id: string | null;
  preferred_species: string;
  living_space: string;
  daily_availability: string;
  activity_level: string;
  pet_experience: string;
  preferred_age: string;
  recommended_pet_ids_json: string[];
  created_at: string;
}

export interface LostFoundRow {
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

export interface VetClinicRow {
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
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'application' | 'match' | 'system' | 'lost_found';
  is_read: number;
  created_at: string;
}

export interface AdminActivityRow {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_table: string;
  target_id: string;
  summary: string;
  created_at: string;
}

export interface LocalRelationalSchema {
  users: UserRow[];
  pets: PetRow[];
  pet_images: PetImageRow[];
  favourites: FavouriteRow[];
  swipe_history: SwipeHistoryRow[];
  adoption_applications: ApplicationRow[];
  quiz_responses: QuizResponseRow[];
  lost_found_reports: LostFoundRow[];
  veterinary_clinics: VetClinicRow[];
  notifications: NotificationRow[];
  admin_activity: AdminActivityRow[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'furever-db.json');

function createSeedData(): LocalRelationalSchema {
  const demoPassHash = bcrypt.hashSync('furever123', 10);
  const now = new Date().toISOString();

  const users: UserRow[] = [
    {
      id: 'user-admin-1',
      full_name: 'Aarav Sharma',
      email: 'admin@furever.com',
      password_hash: demoPassHash,
      role: 'admin',
      phone: '+91 98450 11223',
      city: 'Bengaluru',
      housing_type: 'Independent House',
      bio: 'Platform coordinator and shelter verification administrator.',
      avatar_url: null,
      is_active: 1,
      created_at: now,
    },
    {
      id: 'user-lister-1',
      full_name: 'CARE Bengaluru Rescue',
      email: 'shelter@furever.com',
      password_hash: demoPassHash,
      role: 'lister',
      phone: '+91 98450 44556',
      city: 'Bengaluru',
      housing_type: 'Sanctuary Yard',
      bio: 'Non-profit shelter rescuing and rehabilitating companion animals across Bengaluru.',
      avatar_url: null,
      is_active: 1,
      created_at: now,
    },
    {
      id: 'user-adopter-1',
      full_name: 'Ananya Rao',
      email: 'adopter@furever.com',
      password_hash: demoPassHash,
      role: 'adopter',
      phone: '+91 99001 77889',
      city: 'Indiranagar, Bengaluru',
      housing_type: 'House with Yard',
      bio: 'Animal lover looking to adopt a friendly companion for our family home.',
      avatar_url: null,
      is_active: 1,
      created_at: now,
    },
  ];

  const pets: PetRow[] = [
    {
      id: 'pet-bobi',
      lister_id: 'user-lister-1',
      name: 'Bobi',
      species: 'Dog',
      breed: 'Pug Mix',
      age_label: '2 years',
      age_category: 'Young',
      gender: 'Male',
      weight: '8.5 kg',
      activity_level: 'Moderate',
      location: 'Indiranagar, Bengaluru',
      shelter_name: 'Bangalore Pet Rescue Foundation',
      adoption_fee: 'Free Adoption',
      description: 'A charming fawn pug mix with huge expressive eyes and a goofy personality. Bobi loves snuggling on the sofa, short evening waddles, and greeting neighbors with tail wags.',
      personality_json: ['Goofy', 'Affectionate', 'Friendly', 'Joyful'],
      good_with_json: ['Children', 'Dogs', 'Apartment Living', 'First-time Owners'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'Recent dental checkup cleared. Completely healthy heart and joints.',
      adoption_requirements: 'Indoor home, daily 30-minute gentle walks, and annual wellness checkups.',
      status: 'AVAILABLE',
      is_featured: 1,
      primary_image_url: '/src/assets/images/pet_bobi_pug_1795017785339.jpg',
      created_at: now,
    },
    {
      id: 'pet-speckles',
      lister_id: 'user-lister-1',
      name: 'Speckles',
      species: 'Dog',
      breed: 'Indian Hound Mix',
      age_label: '1.5 years',
      age_category: 'Young',
      gender: 'Male',
      weight: '18 kg',
      activity_level: 'High',
      location: 'Koramangala, Bengaluru',
      shelter_name: 'CARE Bengaluru Rescue Center',
      adoption_fee: 'Free Adoption',
      description: 'Speckles is a curious, energetic Indie hound mix with a distinctive white and black spotted coat. He loves exploring outdoors, learning commands, and making new doggy friends.',
      personality_json: ['Energetic', 'Curious', 'Loyal', 'Social'],
      good_with_json: ['Children', 'Dogs', 'Yard Homes', 'Active Families'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'Fully vaccinated, dewormed, healthy shelter intake checkup completed.',
      adoption_requirements: 'Active household or home with secure terrace/yard space for daily exercise.',
      status: 'AVAILABLE',
      is_featured: 1,
      primary_image_url: '/pets/speckles.jpg',
      created_at: now,
    },
    {
      id: 'pet-goldie',
      lister_id: 'user-lister-1',
      name: 'Goldie',
      species: 'Dog',
      breed: 'Indian Pariah (Indie)',
      age_label: '2 years',
      age_category: 'Adult',
      gender: 'Female',
      weight: '16 kg',
      activity_level: 'Moderate',
      location: 'Indiranagar, Bengaluru',
      shelter_name: 'CARE Bengaluru Rescue Center',
      adoption_fee: 'Free Adoption',
      description: 'Goldie is a calm, noble golden-tan Indie with alert pointed ears and a gentle heart. She loves sunbathing on warm mornings and resting quietly beside her humans.',
      personality_json: ['Calm', 'Gentle', 'Observant', 'Affectionate'],
      good_with_json: ['Children', 'Dogs', 'Quiet Homes', 'First-time Owners'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'Fully vaccinated, spayed, excellent general health and strong immunity.',
      adoption_requirements: 'Loving indoor family; compatible with apartments and independent homes.',
      status: 'AVAILABLE',
      is_featured: 1,
      primary_image_url: '/pets/goldie.jpg',
      created_at: now,
    },
    {
      id: 'pet-rocky',
      lister_id: 'user-lister-1',
      name: 'Rocky',
      species: 'Dog',
      breed: 'Brindle Indie Mix',
      age_label: '3 years',
      age_category: 'Adult',
      gender: 'Male',
      weight: '20 kg',
      activity_level: 'Moderate',
      location: 'Whitefield, Bengaluru',
      shelter_name: 'VOSD Animal Sanctuary',
      adoption_fee: 'Free Adoption',
      description: 'Rocky is a resilient, cheerful brindle-coated boy with a huge heart and a warm open smile. He loves sanctuary playtimes, trot walks, and belly rubs.',
      personality_json: ['Cheerful', 'Friendly', 'Resilient', 'Loving'],
      good_with_json: ['Dogs', 'Families', 'Yard Homes'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'Health check completed, rabies & 9-in-1 vaccinated, neutered.',
      adoption_requirements: 'Two daily walks and a warm sleeping corner indoors.',
      status: 'AVAILABLE',
      is_featured: 1,
      primary_image_url: '/pets/rocky.jpg',
      created_at: now,
    },
    {
      id: 'pet-daisy',
      lister_id: 'user-lister-1',
      name: 'Daisy',
      species: 'Dog',
      breed: 'Labrador Indie Mix',
      age_label: '1 year',
      age_category: 'Young',
      gender: 'Female',
      weight: '19 kg',
      activity_level: 'Moderate',
      location: 'HSR Layout, Bengaluru',
      shelter_name: 'Bangalore Animal Rescue Trust',
      adoption_fee: 'Free Adoption',
      description: 'Daisy is a joyful cream-colored Labrador Indie mix who spreads happiness wherever she sits. She is house-trained, affectionate, and loves relaxing outdoors.',
      personality_json: ['Joyful', 'Playful', 'Smart', 'Gentle'],
      good_with_json: ['Children', 'Cats', 'Dogs', 'Apartment Living'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'Fully vaccinated, spayed, parasite treated.',
      adoption_requirements: 'Great for families and first-time adopters; enjoys interactive puzzle toys.',
      status: 'AVAILABLE',
      is_featured: 1,
      primary_image_url: '/pets/daisy.jpg',
      created_at: now,
    },
    {
      id: 'pet-bruno',
      lister_id: 'user-lister-1',
      name: 'Bruno',
      species: 'Dog',
      breed: 'Golden Retriever',
      age_label: '2.5 years',
      age_category: 'Adult',
      gender: 'Male',
      weight: '24 kg',
      activity_level: 'High',
      location: 'Sadashivanagar, Bengaluru',
      shelter_name: 'CUPA Bengaluru',
      adoption_fee: '₹1,500 donation',
      description: 'Friendly, playful and always ready for an adventure. Bruno loves belly rubs, playing fetch in Cubbon Park, and greeting everyone with a sunny tail wag.',
      personality_json: ['Playful', 'Friendly', 'Active', 'Gentle'],
      good_with_json: ['Children', 'Dogs', 'First-time Owners', 'Yard Homes'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'Up to date on rabies and DHPP vaccines. Routine health screening cleared.',
      adoption_requirements: 'Regular brushing and 45+ minutes of daily outdoor play or fetch.',
      status: 'AVAILABLE',
      is_featured: 1,
      primary_image_url: '/src/assets/images/pet_bruno_golden_1795017785356.jpg',
      created_at: now,
    },
    {
      id: 'pet-mochi',
      lister_id: 'user-lister-1',
      name: 'Mochi',
      species: 'Cat',
      breed: 'Domestic Shorthair Tabby',
      age_label: '1 year',
      age_category: 'Young',
      gender: 'Female',
      weight: '3.8 kg',
      activity_level: 'Moderate',
      location: 'Koramangala, Bengaluru',
      shelter_name: 'Whiskers Haven Rescue',
      adoption_fee: '₹1,200 donation',
      description: 'A sweet and curious bundle of purrs with striking green eyes. Mochi enjoys napping on warm window sills, chasing feather toys, and curling up beside you.',
      personality_json: ['Affectionate', 'Curious', 'Quiet', 'Cuddly'],
      good_with_json: ['Children', 'Cats', 'Apartment Living', 'First-time Owners'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'FIV/FeLV negative. Teeth in pristine health. Dewormed regularly.',
      adoption_requirements: 'Strictly indoor home with netted balconies/windows for safety.',
      status: 'AVAILABLE',
      is_featured: 1,
      primary_image_url: '/src/assets/images/pet_mochi_cat_1795017786328.jpg',
      created_at: now,
    },
    {
      id: 'pet-luna',
      lister_id: 'user-lister-1',
      name: 'Luna',
      species: 'Cat',
      breed: 'Ginger Domestic Cat',
      age_label: '4 years',
      age_category: 'Adult',
      gender: 'Female',
      weight: '4.1 kg',
      activity_level: 'Low',
      location: 'HSR Layout, Bengaluru',
      shelter_name: 'Voice for Animals (VFA)',
      adoption_fee: '₹1,200 donation',
      description: 'Luna has a radiant ginger coat and a serene, affectionate personality. She is calm, graceful, and bonds deeply with her family once settled in.',
      personality_json: ['Calm', 'Gentle', 'Observant', 'Lap Cat'],
      good_with_json: ['Quiet Homes', 'Seniors', 'Cats', 'Apartment Living'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 1,
      health_notes: 'Microchipped & recent annual checkup cleared. Healthy coat and balanced diet.',
      adoption_requirements: 'Quiet indoor apartment with cozy resting spots and netted windows.',
      status: 'AVAILABLE',
      is_featured: 0,
      primary_image_url: '/src/assets/images/pet_luna_ginger_cat_1795017786052.jpg',
      created_at: now,
    },
    {
      id: 'pet-clover',
      lister_id: 'user-lister-1',
      name: 'Clover',
      species: 'Rabbit',
      breed: 'Holland Lop Bunny',
      age_label: '8 months',
      age_category: 'Young',
      gender: 'Female',
      weight: '1.9 kg',
      activity_level: 'Moderate',
      location: 'Jayanagar, Bengaluru',
      shelter_name: 'Bangalore Bunny Haven',
      adoption_fee: '₹1,000 donation',
      description: 'An adorable floppy-eared bunny who loves munching on organic timothy hay, doing cheerful binkies on the rug, and gentle chin scratches.',
      personality_json: ['Curious', 'Docile', 'Playful', 'Sweet'],
      good_with_json: ['Indoor Enclosures', 'Gentle Hands', 'Apartment Living'],
      vaccinated: 1,
      spayed_neutered: 1,
      microchipped: 0,
      health_notes: 'Spayed and vaccinated against RHDV2. Healthy dental checkup.',
      adoption_requirements: 'Rabbit-proofed indoor playpen with unlimited timothy hay and fresh greens.',
      status: 'AVAILABLE',
      is_featured: 0,
      primary_image_url: '/src/assets/images/pet_clover_bunny_1795017786624.jpg',
      created_at: now,
    },
    {
      id: 'pet-kiwi',
      lister_id: 'user-lister-1',
      name: 'Kiwi',
      species: 'Bird',
      breed: 'Budgerigar Parakeet',
      age_label: '1 year',
      age_category: 'Young',
      gender: 'Male',
      weight: '42 g',
      activity_level: 'Moderate',
      location: 'JP Nagar, Bengaluru',
      shelter_name: 'Feather & Wing Sanctuary',
      adoption_fee: '₹600 donation',
      description: 'A cheerful, sky-blue and lemon budgie who whistles melodic tunes every morning and loves hopping onto fingers for millet treats.',
      personality_json: ['Musical', 'Social', 'Curious', 'Bright'],
      good_with_json: ['Apartments', 'Quiet Homes', 'Bird Lovers'],
      vaccinated: 1,
      spayed_neutered: 0,
      microchipped: 0,
      health_notes: 'Avian vet checked; clean feathers, healthy beak and respiratory check.',
      adoption_requirements: 'Spacious flight cage with natural wood perches and daily supervised out-of-cage time.',
      status: 'AVAILABLE',
      is_featured: 0,
      primary_image_url: '/src/assets/images/pet_kiwi_bird_1795017786057.jpg',
      created_at: now,
    },
  ];

  const pet_images: PetImageRow[] = [
    { id: 'img-bobi-1', pet_id: 'pet-bobi', image_url: '/src/assets/images/pet_bobi_pug_1795017785339.jpg', caption: 'Bobi soaking up morning sunshine', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-bobi-2', pet_id: 'pet-bobi', image_url: '/pets/daisy.jpg', caption: 'Bobi hanging out with shelter friends', is_primary: 0, sort_order: 2, created_at: now },
    { id: 'img-speckles-1', pet_id: 'pet-speckles', image_url: '/pets/speckles.jpg', caption: 'Speckles exploring the shelter yard', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-goldie-1', pet_id: 'pet-goldie', image_url: '/pets/goldie.jpg', caption: 'Goldie enjoying a peaceful afternoon', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-rocky-1', pet_id: 'pet-rocky', image_url: '/pets/rocky.jpg', caption: 'Rocky flashing his warm smile', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-daisy-1', pet_id: 'pet-daisy', image_url: '/pets/daisy.jpg', caption: 'Daisy relaxing in the garden', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-bruno-1', pet_id: 'pet-bruno', image_url: '/src/assets/images/pet_bruno_golden_1795017785356.jpg', caption: 'Bruno ready for a game of fetch', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-mochi-1', pet_id: 'pet-mochi', image_url: '/src/assets/images/pet_mochi_cat_1795017786328.jpg', caption: 'Mochi by the sunny window', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-luna-1', pet_id: 'pet-luna', image_url: '/src/assets/images/pet_luna_ginger_cat_1795017786052.jpg', caption: 'Luna curled up for a nap', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-clover-1', pet_id: 'pet-clover', image_url: '/src/assets/images/pet_clover_bunny_1795017786624.jpg', caption: 'Clover on her favorite knit blanket', is_primary: 1, sort_order: 1, created_at: now },
    { id: 'img-kiwi-1', pet_id: 'pet-kiwi', image_url: '/src/assets/images/pet_kiwi_bird_1795017786057.jpg', caption: 'Kiwi perched outdoors', is_primary: 1, sort_order: 1, created_at: now },
  ];

  const veterinary_clinics: VetClinicRow[] = [
    {
      id: 'vet-1',
      clinic_name: 'Cessna Lifeline Veterinary Hospital',
      vet_name: 'Dr. Ramesh Nagaraj, MVSc',
      city: 'Domlur, Bengaluru',
      address: '148, HBCS Amarjyoti Layout, Domlur, Bengaluru 560071',
      phone: '+91 80 4125 6090',
      email: 'care@cessnalifeline.org',
      hours: 'Open 24 Hours (Mon–Sun)',
      services_json: ['24/7 Emergency ICU', 'Vaccinations', 'Orthopedic Surgery', 'Dental Care', 'Microchipping'],
      emergency_24_7: 1,
      rating: 4.9,
      is_verified: 1,
      created_at: now,
    },
    {
      id: 'vet-2',
      clinic_name: 'Indiranagar Pet Care & Wellness Clinic',
      vet_name: 'Dr. Meera Krishnan, BVSc',
      city: 'Indiranagar, Bengaluru',
      address: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      phone: '+91 80 2528 3344',
      email: 'hello@indiranagarvets.in',
      hours: '9:00 AM – 8:30 PM (Daily)',
      services_json: ['Preventive Checkups', 'Puppy & Kitten Shots', 'Spay/Neuter', 'Dermatology', 'Nutrition Counseling'],
      emergency_24_7: 0,
      rating: 4.8,
      is_verified: 1,
      created_at: now,
    },
    {
      id: 'vet-3',
      clinic_name: 'Koramangala Paws & Wings Vet Center',
      vet_name: 'Dr. Vikram Hegde, MVSc',
      city: 'Koramangala, Bengaluru',
      address: '4th Block, 80 Feet Road, Koramangala, Bengaluru 560034',
      phone: '+91 80 4110 7788',
      email: 'clinic@pawsandwings.in',
      hours: '9:30 AM – 9:00 PM (Mon–Sat)',
      services_json: ['Small Animal & Exotic Care', 'Avian Medicine', 'Rabbit Dental Care', 'Ultrasound & Lab', 'Vaccinations'],
      emergency_24_7: 0,
      rating: 4.9,
      is_verified: 1,
      created_at: now,
    },
    {
      id: 'vet-4',
      clinic_name: 'Whitefield Companion Veterinary Hospital',
      vet_name: 'Dr. Sunita Deshmukh, MVSc',
      city: 'Whitefield, Bengaluru',
      address: 'ITPL Main Road, Brookefield, Whitefield, Bengaluru 560037',
      phone: '+91 80 2845 9911',
      email: 'support@whitefieldvet.in',
      hours: 'Open 24 Hours (Emergency)',
      services_json: ['24/7 Trauma Care', 'Digital X-Ray', 'Vaccinations', 'Senior Pet Wellness', 'Behavioral Consults'],
      emergency_24_7: 1,
      rating: 4.7,
      is_verified: 1,
      created_at: now,
    },
  ];

  const lost_found_reports: LostFoundRow[] = [
    {
      id: 'lf-1',
      reporter_id: 'user-adopter-1',
      report_type: 'lost',
      pet_name: 'Coco',
      species: 'Dog',
      breed: 'Indie Hound Mix',
      color_markings: 'White coat with dark speckled ears and blue reflective collar',
      last_seen_location: '100 Feet Road, Indiranagar, Bengaluru',
      report_date: '2026-11-15',
      description: 'Slipped out near CMH park gate around 6:30 PM. Very friendly, responds to whistling and Coco.',
      contact_name: 'Rohan Verma',
      contact_phone: '+91 98451 22334',
      contact_email: 'rohan.verma@example.com',
      photo_url: '/pets/speckles.jpg',
      status: 'Open',
      created_at: now,
    },
    {
      id: 'lf-2',
      reporter_id: 'user-lister-1',
      report_type: 'found',
      pet_name: 'Unknown Tabby',
      species: 'Cat',
      breed: 'Domestic Shorthair',
      color_markings: 'Warm brown mackerel tabby with white paws and green eyes',
      last_seen_location: '3rd Block Park, Koramangala, Bengaluru',
      report_date: '2026-11-16',
      description: 'Found hiding near bakery awning during rain. Calm and clearly used to being indoors. Currently safe at Whiskers Haven.',
      contact_name: 'Priya Menon',
      contact_phone: '+91 99002 55441',
      contact_email: 'shelter@furever.com',
      photo_url: '/src/assets/images/pet_mochi_cat_1795017786328.jpg',
      status: 'Open',
      created_at: now,
    },
    {
      id: 'lf-3',
      reporter_id: 'user-adopter-1',
      report_type: 'lost',
      pet_name: 'Peanut',
      species: 'Rabbit',
      breed: 'Holland Lop',
      color_markings: 'Cream white coat with caramel floppy ears',
      last_seen_location: '4th T Block, Jayanagar, Bengaluru',
      report_date: '2026-11-12',
      description: 'Escaped from backyard enclosure; reunited safely with help from neighbors!',
      contact_name: 'Kavya Shetty',
      contact_phone: '+91 97400 88112',
      contact_email: 'kavya@example.com',
      photo_url: '/src/assets/images/pet_clover_bunny_1795017786624.jpg',
      status: 'Reunited',
      created_at: now,
    },
  ];

  const adoption_applications: ApplicationRow[] = [
    {
      id: 'app-demo-1',
      pet_id: 'pet-goldie',
      applicant_id: 'user-adopter-1',
      lister_id: 'user-lister-1',
      applicant_name: 'Ananya Rao',
      applicant_email: 'adopter@furever.com',
      applicant_phone: '+91 99001 77889',
      city: 'Indiranagar, Bengaluru',
      housing_type: 'House with Yard',
      has_yard: 1,
      pet_experience: 'Previous pet owner',
      household_members: '2 Adults, 1 Child (10 yrs)',
      daily_alone_hours: '2-4 hours',
      fit_reason: 'We have a peaceful independent home with a secure walled garden and work hybrid schedules so Goldie will have companionship most of the day. Our family previously cared for a senior Indie dog for 12 years and understands preventive vet care, daily walks, and positive reinforcement.',
      eligibility_result: 'APPLICABLE',
      eligibility_reason: 'Application successfully verified as applicable!',
      status: 'Under Review',
      reviewer_notes: 'Home check scheduled for this weekend.',
      created_at: now,
      updated_at: now,
    },
  ];

  const favourites: FavouriteRow[] = [
    {
      id: 'fav-demo-1',
      user_id: 'user-adopter-1',
      pet_id: 'pet-bobi',
      created_at: now,
    },
  ];

  const notifications: NotificationRow[] = [
    {
      id: 'notif-1',
      user_id: 'user-adopter-1',
      title: 'Application Under Review',
      message: 'CARE Bengaluru Rescue is reviewing your application for Goldie.',
      type: 'application',
      is_read: 0,
      created_at: now,
    },
  ];

  const admin_activity: AdminActivityRow[] = [
    {
      id: 'act-1',
      admin_id: 'user-admin-1',
      action_type: 'SYSTEM_SEED',
      target_table: 'pets',
      target_id: 'all',
      summary: 'Initialized FurEver relational database with verified shelter pets and clinics.',
      created_at: now,
    },
  ];

  return {
    users,
    pets,
    pet_images,
    favourites,
    swipe_history: [],
    adoption_applications,
    quiz_responses: [],
    lost_found_reports,
    veterinary_clinics,
    notifications,
    admin_activity,
  };
}

let cachedStore: LocalRelationalSchema | null = null;

export function getLocalStore(): LocalRelationalSchema {
  if (cachedStore) return cachedStore;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedStore = JSON.parse(raw) as LocalRelationalSchema;
      return cachedStore;
    } catch {
      // Recreate if corrupted
    }
  }
  cachedStore = createSeedData();
  saveLocalStore();
  return cachedStore;
}

export function saveLocalStore(): void {
  if (!cachedStore) return;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(cachedStore, null, 2), 'utf-8');
}
