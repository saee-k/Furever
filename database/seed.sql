-- FurEver Seed Data for MySQL Testing
-- Demo passwords for all seeded accounts: "furever123"
-- Password hash generated with bcryptjs (cost 10)

USE furever_db;

INSERT IGNORE INTO users (id, full_name, email, password_hash, role, phone, city, housing_type, bio, is_active) VALUES
('user-admin-1', 'Aarav Sharma (Admin)', 'admin@furever.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+91 98450 11223', 'Bengaluru', 'Independent House', 'Platform coordinator and shelter verification administrator.', 1),
('user-lister-1', 'CARE Bengaluru Rescue', 'shelter@furever.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lister', '+91 98450 44556', 'Bengaluru', 'Sanctuary Yard', 'Non-profit shelter rescuing and rehabilitating companion animals across Bengaluru.', 1),
('user-adopter-1', 'Ananya Rao', 'adopter@furever.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'adopter', '+91 99001 77889', 'Indiranagar, Bengaluru', 'House with Yard', 'Animal lover looking to adopt a friendly companion for our family home.', 1);

INSERT IGNORE INTO pets (
  id, lister_id, name, species, breed, age_label, age_category, gender, weight,
  activity_level, location, shelter_name, adoption_fee, description,
  personality_json, good_with_json, vaccinated, spayed_neutered, microchipped,
  health_notes, adoption_requirements, status, is_featured, primary_image_url
) VALUES
(
  'pet-bobi', 'user-lister-1', 'Bobi', 'Dog', 'Pug Mix', '2 years', 'Young', 'Male', '8.5 kg',
  'Moderate', 'Indiranagar, Bengaluru', 'Bangalore Pet Rescue Foundation', 'Free Adoption',
  'A charming fawn pug mix with huge expressive eyes and a goofy personality. Bobi loves snuggling on the sofa, short evening waddles, and greeting neighbors with tail wags.',
  '["Goofy","Affectionate","Friendly","Joyful"]', '["Children","Dogs","Apartment Living","First-time Owners"]',
  1, 1, 1, 'Recent dental checkup cleared. Completely healthy heart and joints.',
  'Indoor home, daily 30-minute gentle walks, and annual wellness checkups.', 'AVAILABLE', 1,
  '/src/assets/images/pet_bobi_pug_1795017785339.jpg'
),
(
  'pet-speckles', 'user-lister-1', 'Speckles', 'Dog', 'Indian Hound Mix', '1.5 years', 'Young', 'Male', '18 kg',
  'High', 'Koramangala, Bengaluru', 'CARE Bengaluru Rescue Center', 'Free Adoption',
  'Speckles is a curious, energetic Indie hound mix with a distinctive white and black spotted coat. He loves exploring outdoors, learning commands, and making new doggy friends.',
  '["Energetic","Curious","Loyal","Social"]', '["Children","Dogs","Yard Homes","Active Families"]',
  1, 1, 1, 'Fully vaccinated, dewormed, healthy shelter intake checkup completed.',
  'Active household or home with secure terrace/yard space for daily exercise.', 'AVAILABLE', 1,
  '/pets/speckles.jpg'
),
(
  'pet-goldie', 'user-lister-1', 'Goldie', 'Dog', 'Indian Pariah (Indie)', '2 years', 'Adult', 'Female', '16 kg',
  'Moderate', 'Indiranagar, Bengaluru', 'CARE Bengaluru Rescue Center', 'Free Adoption',
  'Goldie is a calm, noble golden-tan Indie with alert pointed ears and a gentle heart. She loves sunbathing on warm mornings and resting quietly beside her humans.',
  '["Calm","Gentle","Observant","Affectionate"]', '["Children","Dogs","Quiet Homes","First-time Owners"]',
  1, 1, 1, 'Fully vaccinated, spayed, excellent general health and strong immunity.',
  'Loving indoor family; compatible with apartments and independent homes.', 'AVAILABLE', 1,
  '/pets/goldie.jpg'
),
(
  'pet-rocky', 'user-lister-1', 'Rocky', 'Dog', 'Brindle Indie Mix', '3 years', 'Adult', 'Male', '20 kg',
  'Moderate', 'Whitefield, Bengaluru', 'VOSD Animal Sanctuary', 'Free Adoption',
  'Rocky is a resilient, cheerful brindle-coated boy with a huge heart and a warm open smile. He loves sanctuary playtimes, trot walks, and belly rubs.',
  '["Cheerful","Friendly","Resilient","Loving"]', '["Dogs","Families","Yard Homes"]',
  1, 1, 1, 'Health check completed, rabies & 9-in-1 vaccinated, neutered.',
  'Two daily walks and a warm sleeping corner indoors.', 'AVAILABLE', 1,
  '/pets/rocky.jpg'
),
(
  'pet-daisy', 'user-lister-1', 'Daisy', 'Dog', 'Labrador Indie Mix', '1 year', 'Young', 'Female', '19 kg',
  'Moderate', 'HSR Layout, Bengaluru', 'Bangalore Animal Rescue Trust', 'Free Adoption',
  'Daisy is a joyful cream-colored Labrador Indie mix who spreads happiness wherever she sits. She is house-trained, affectionate, and loves relaxing outdoors.',
  '["Joyful","Playful","Smart","Gentle"]', '["Children","Cats","Dogs","Apartment Living"]',
  1, 1, 1, 'Fully vaccinated, spayed, parasite treated.',
  'Great for families and first-time adopters; enjoys interactive puzzle toys.', 'AVAILABLE', 1,
  '/pets/daisy.jpg'
),
(
  'pet-bruno', 'user-lister-1', 'Bruno', 'Dog', 'Golden Retriever', '2.5 years', 'Adult', 'Male', '24 kg',
  'High', 'Sadashivanagar, Bengaluru', 'CUPA Bengaluru', '₹1,500 donation',
  'Friendly, playful and always ready for an adventure. Bruno loves belly rubs, playing fetch in Cubbon Park, and greeting everyone with a sunny tail wag.',
  '["Playful","Friendly","Active","Gentle"]', '["Children","Dogs","First-time Owners","Yard Homes"]',
  1, 1, 1, 'Up to date on rabies and DHPP vaccines. Routine health screening cleared.',
  'Regular brushing and 45+ minutes of daily outdoor play or fetch.', 'AVAILABLE', 1,
  '/src/assets/images/pet_bruno_golden_1795017785356.jpg'
),
(
  'pet-mochi', 'user-lister-1', 'Mochi', 'Cat', 'Domestic Shorthair Tabby', '1 year', 'Young', 'Female', '3.8 kg',
  'Moderate', 'Koramangala, Bengaluru', 'Whiskers Haven Rescue', '₹1,200 donation',
  'A sweet and curious bundle of purrs with striking green eyes. Mochi enjoys napping on warm window sills, chasing feather toys, and curling up beside you.',
  '["Affectionate","Curious","Quiet","Cuddly"]', '["Children","Cats","Apartment Living","First-time Owners"]',
  1, 1, 1, 'FIV/FeLV negative. Teeth in pristine health. Dewormed regularly.',
  'Strictly indoor home with netted balconies/windows for safety.', 'AVAILABLE', 1,
  '/src/assets/images/pet_mochi_cat_1795017786328.jpg'
),
(
  'pet-luna', 'user-lister-1', 'Luna', 'Cat', 'Ginger Domestic Cat', '4 years', 'Adult', 'Female', '4.1 kg',
  'Low', 'HSR Layout, Bengaluru', 'Voice for Animals (VFA)', '₹1,200 donation',
  'Luna has a radiant ginger coat and a serene, affectionate personality. She is calm, graceful, and bonds deeply with her family once settled in.',
  '["Calm","Gentle","Observant","Lap Cat"]', '["Quiet Homes","Seniors","Cats","Apartment Living"]',
  1, 1, 1, 'Microchipped & recent annual checkup cleared. Healthy coat and balanced diet.',
  'Quiet indoor apartment with cozy resting spots and netted windows.', 'AVAILABLE', 0,
  '/src/assets/images/pet_luna_ginger_cat_1795017786052.jpg'
),
(
  'pet-clover', 'user-lister-1', 'Clover', 'Rabbit', 'Holland Lop Bunny', '8 months', 'Young', 'Female', '1.9 kg',
  'Moderate', 'Jayanagar, Bengaluru', 'Bangalore Bunny Haven', '₹1,000 donation',
  'An adorable floppy-eared bunny who loves munching on organic timothy hay, doing cheerful binkies on the rug, and gentle chin scratches.',
  '["Curious","Docile","Playful","Sweet"]', '["Indoor Enclosures","Gentle Hands","Apartment Living"]',
  1, 1, 0, 'Spayed and vaccinated against RHDV2. Healthy dental checkup.',
  'Rabbit-proofed indoor playpen with unlimited timothy hay and fresh greens.', 'AVAILABLE', 0,
  '/src/assets/images/pet_clover_bunny_1795017786624.jpg'
),
(
  'pet-kiwi', 'user-lister-1', 'Kiwi', 'Bird', 'Budgerigar Parakeet', '1 year', 'Young', 'Male', '42 g',
  'Moderate', 'JP Nagar, Bengaluru', 'Feather & Wing Sanctuary', '₹600 donation',
  'A cheerful, sky-blue and lemon budgie who whistles melodic tunes every morning and loves hopping onto fingers for millet treats.',
  '["Musical","Social","Curious","Bright"]', '["Apartments","Quiet Homes","Bird Lovers"]',
  1, 0, 0, 'Avian vet checked; clean feathers, healthy beak and respiratory check.',
  'Spacious flight cage with natural wood perches and daily supervised out-of-cage time.', 'AVAILABLE', 0,
  '/src/assets/images/pet_kiwi_bird_1795017786057.jpg'
);

INSERT IGNORE INTO pet_images (id, pet_id, image_url, caption, is_primary, sort_order) VALUES
('img-bobi-1', 'pet-bobi', '/src/assets/images/pet_bobi_pug_1795017785339.jpg', 'Bobi soaking up morning sunshine', 1, 1),
('img-bobi-2', 'pet-bobi', '/pets/daisy.jpg', 'Bobi with shelter playmate Daisy', 0, 2),
('img-speckles-1', 'pet-speckles', '/pets/speckles.jpg', 'Speckles in the shelter yard', 1, 1),
('img-goldie-1', 'pet-goldie', '/pets/goldie.jpg', 'Goldie resting peacefully', 1, 1),
('img-rocky-1', 'pet-rocky', '/pets/rocky.jpg', 'Rocky smiling after a walk', 1, 1),
('img-daisy-1', 'pet-daisy', '/pets/daisy.jpg', 'Daisy enjoying afternoon breeze', 1, 1),
('img-bruno-1', 'pet-bruno', '/src/assets/images/pet_bruno_golden_1795017785356.jpg', 'Bruno at the park', 1, 1),
('img-mochi-1', 'pet-mochi', '/src/assets/images/pet_mochi_cat_1795017786328.jpg', 'Mochi on her favorite sunny sill', 1, 1),
('img-luna-1', 'pet-luna', '/src/assets/images/pet_luna_ginger_cat_1795017786052.jpg', 'Luna curled up on linen', 1, 1),
('img-clover-1', 'pet-clover', '/src/assets/images/pet_clover_bunny_1795017786624.jpg', 'Clover relaxing on a knit blanket', 1, 1),
('img-kiwi-1', 'pet-kiwi', '/src/assets/images/pet_kiwi_bird_1795017786057.jpg', 'Kiwi perched on a branch', 1, 1);

INSERT IGNORE INTO veterinary_clinics (id, clinic_name, vet_name, city, address, phone, email, hours, services_json, emergency_24_7, rating, is_verified) VALUES
('vet-1', 'Cessna Lifeline Veterinary Hospital', 'Dr. Ramesh Nagaraj, MVSc', 'Domlur, Bengaluru', '148, HBCS Amarjyoti Layout, Domlur, Bengaluru 560071', '+91 80 4125 6090', 'care@cessnalifeline.org', 'Open 24 Hours (Mon–Sun)', '["24/7 Emergency ICU","Vaccinations","Orthopedic Surgery","Dental Care","Microchipping"]', 1, 4.9, 1),
('vet-2', 'Indiranagar Pet Care & Wellness Clinic', 'Dr. Meera Krishnan, BVSc', 'Indiranagar, Bengaluru', '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038', '+91 80 2528 3344', 'hello@indiranagarvets.in', '9:00 AM – 8:30 PM (Daily)', '["Preventive Checkups","Puppy & Kitten Shots","Spay/Neuter","Dermatology","Nutrition Counseling"]', 0, 4.8, 1),
('vet-3', 'Koramangala Paws & Wings Vet Center', 'Dr. Vikram Hegde, MVSc', 'Koramangala, Bengaluru', '4th Block, 80 Feet Road, Koramangala, Bengaluru 560034', '+91 80 4110 7788', 'clinic@pawsandwings.in', '9:30 AM – 9:00 PM (Mon–Sat)', '["Small Animal & Exotic Care","Avian Medicine","Rabbit Dental Care","Ultrasound & Lab","Vaccinations"]', 0, 4.9, 1),
('vet-4', 'Whitefield Companion Veterinary Hospital', 'Dr. Sunita Deshmukh, MVSc', 'Whitefield, Bengaluru', 'ITPL Main Road, Brookefield, Whitefield, Bengaluru 560037', '+91 80 2845 9911', 'support@whitefieldvet.in', 'Open 24 Hours (Emergency)', '["24/7 Trauma Care","Digital X-Ray","Vaccinations","Senior Pet Wellness","Behavioral Consults"]', 1, 4.7, 1);

INSERT IGNORE INTO lost_found_reports (id, reporter_id, report_type, pet_name, species, breed, color_markings, last_seen_location, report_date, description, contact_name, contact_phone, contact_email, photo_url, status) VALUES
('lf-1', 'user-adopter-1', 'lost', 'Coco', 'Dog', 'Beagle Mix', 'Tricolor brown, black & white with blue reflective collar', '100 Feet Road, Indiranagar, Bengaluru', '2026-11-15', 'Slipped out near CMH park gate around 6:30 PM. Very friendly, responds to whistling and Coco.', 'Rohan Verma', '+91 98451 22334', 'rohan.verma@example.com', '/pets/speckles.jpg', 'Open'),
('lf-2', 'user-lister-1', 'found', 'Unknown Tabby', 'Cat', 'Domestic Shorthair', 'Warm brown mackerel tabby with white paws and green eyes', '3rd Block Park, Koramangala, Bengaluru', '2026-11-16', 'Found hiding near bakery awning during rain. Calm and clearly used to being indoors. Currently safe at Whiskers Haven.', 'Priya Menon', '+91 99002 55441', 'shelter@furever.com', '/src/assets/images/pet_mochi_cat_1795017786328.jpg', 'Open'),
('lf-3', 'user-adopter-1', 'lost', 'Peanut', 'Rabbit', 'Lionhead Mix', 'Cream white coat with fluffy caramel ears', '4th T Block, Jayanagar, Bengaluru', '2026-11-12', 'Escaped from backyard enclosure; reunited safely with help from neighbors!', 'Kavya Shetty', '+91 97400 88112', 'kavya@example.com', '/src/assets/images/pet_clover_bunny_1795017786624.jpg', 'Reunited');
