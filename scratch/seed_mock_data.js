import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockBusinesses = [
  // 1. Healthcare
  {
    id: "39c9c5b9-83b0-4a5b-901d-55166db8dc10",
    name: "City Health Clinic",
    slug: "city-clinic",
    industry_type: "healthcare",
    address: "742 Evergreen Terrace, Springfield",
    rating: 4.8,
    review_count: 124,
    description: "Your local destination for comprehensive family medicine and dental checkups."
  },
  {
    id: "b2c9c5b9-83b0-4a5b-901d-55166db8dc11",
    name: "Metro Dental Care",
    slug: "metro-dental",
    industry_type: "healthcare",
    address: "105 Medical Plaza, Downtown",
    rating: 4.7,
    review_count: 98,
    description: "State-of-the-art dental clinic providing premium cosmetic and general dentistry."
  },
  
  // 2. Restaurant
  {
    id: "31fe3cc4-293c-4380-94e1-a56207d8c479",
    name: "The Olive Bistro",
    slug: "olive-bistro",
    industry_type: "restaurant",
    address: "1024 Gourmet Boulevard, Food District",
    rating: 4.6,
    review_count: 85,
    description: "Cozy bistro serving authentic Italian woodfired pizza and premium pasta."
  },
  {
    id: "a2fe3cc4-293c-4380-94e1-a56207d8c480",
    name: "Sakura Sushi Bar",
    slug: "sakura-sushi",
    industry_type: "restaurant",
    address: "44 Wasabi Avenue, Little Tokyo",
    rating: 4.9,
    review_count: 167,
    description: "Premium sushi bar featuring fresh local ingredients and traditional Omakase experiences."
  },

  // 3. Cafe
  {
    id: "a3f5b9d2-1c2d-4e5f-8a9b-0c1d2e3f4a5b",
    name: "Java Junction Cafe",
    slug: "java-junction",
    industry_type: "cafe",
    address: "88 Caffeine Way, Metro Center",
    rating: 4.7,
    review_count: 312,
    description: "Artisan coffee house with signature cold brews, pastries, and co-working workspace."
  },
  {
    id: "c2f5b9d2-1c2d-4e5f-8a9b-0c1d2e3f4a5c",
    name: "Bean & Brew",
    slug: "bean-brew",
    industry_type: "cafe",
    address: "12 Espresso Lane, Lakeside",
    rating: 4.5,
    review_count: 145,
    description: "Relaxed lakeside cafe famous for house-roasted single origin beans and breakfast wraps."
  },

  // 4. Education
  {
    id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
    name: "Beacon Academy",
    slug: "beacon-learning",
    industry_type: "education",
    address: "404 Scholar Lane, University Town",
    rating: 4.5,
    review_count: 67,
    description: "Tutoring center offering targeted coaching for high school mathematics, science, and SAT prep."
  },
  {
    id: "e2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9b",
    name: "CodeCraft Coding Bootcamp",
    slug: "codecraft-academy",
    industry_type: "education",
    address: "99 Developer Highway, Tech Park",
    rating: 4.8,
    review_count: 89,
    description: "Industry-aligned immersive coding bootcamps for web design, React, and server backend development."
  },

  // 5. Hospitality
  {
    id: "d1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9c",
    name: "Grand Plaza Hotel",
    slug: "grand-hotel",
    industry_type: "hospitality",
    address: "1 Luxury Drive, City Center",
    rating: 4.7,
    review_count: 420,
    description: "5-star luxury hotel featuring city-view rooms, rooftop pool, and wellness spa."
  },
  {
    id: "d2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9d",
    name: "Cozy Cabins Resort",
    slug: "cozy-cabins",
    industry_type: "hospitality",
    address: "500 Mountain Trail, Alpine Hills",
    rating: 4.6,
    review_count: 112,
    description: "Serene mountain retreats with stone fireplaces, hot tubs, and private hiking trails."
  },

  // 6. Retail
  {
    id: "f1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9e",
    name: "Urban Threads Clothing",
    slug: "urban-threads",
    industry_type: "retail",
    address: "303 Fashion Street, SOHO",
    rating: 4.4,
    review_count: 245,
    description: "Curated streetwear and luxury lifestyle fashion collections for men and women."
  },
  {
    id: "f2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9f",
    name: "Gadget Grove Electronics",
    slug: "gadget-grove",
    industry_type: "retail",
    address: "15 Silicon Boulevard, Tech Hub",
    rating: 4.6,
    review_count: 180,
    description: "Smart home appliances, phone accessories, audio gear, and customizable hardware setups."
  },

  // 7. Real Estate
  {
    id: "c1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa1",
    name: "Skyline Realty",
    slug: "skyline-realty",
    industry_type: "real_estate",
    address: "700 Penthouse Way, Highrise District",
    rating: 4.7,
    review_count: 56,
    description: "Luxury property sales, listings, apartment rentals, and real estate valuation."
  },
  {
    id: "c2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa2",
    name: "Oakwood Property Management",
    slug: "oakwood-properties",
    industry_type: "real_estate",
    address: "411 Maple Street, Suburbia",
    rating: 4.3,
    review_count: 42,
    description: "Residential asset management, tenant placements, maintenance coordination, and rent collection."
  },

  // 8. Manufacturing
  {
    id: "b115f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa3",
    name: "MetalCraft Fabricators",
    slug: "metalcraft-fab",
    industry_type: "manufacturing",
    address: "80 Industrial Road, Factory Zone",
    rating: 4.5,
    review_count: 34,
    description: "Precision CNC machining, laser metal cutting, sheet metal folding, and heavy steel structures."
  },
  {
    id: "b215f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa4",
    name: "EcoPlastic Solutions",
    slug: "ecoplastic-solutions",
    industry_type: "manufacturing",
    address: "10 Recycle Avenue, Green Park",
    rating: 4.8,
    review_count: 51,
    description: "Sustainable injection molding, recycled polymer products, and bioplastic manufacturing."
  },

  // 9. Agriculture
  {
    id: "a115f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa5",
    name: "SunGold Organic Farm",
    slug: "sungold-farm",
    industry_type: "agriculture",
    address: "22 Harvest Road, Valley Center",
    rating: 4.9,
    review_count: 73,
    description: "Certified pesticide-free fruits, root vegetables, organic eggs, and educational farm tours."
  },
  {
    id: "a215f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa6",
    name: "Valley Vineyard & Orchards",
    slug: "valley-vineyard",
    industry_type: "agriculture",
    address: "9 Vineyard Route, Hills Valley",
    rating: 4.7,
    review_count: 88,
    description: "Award-winning regional grape vineyards offering boutique wine tastings and apple picking."
  },

  // 10. Service
  {
    id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e11",
    name: "Apex Gym & Fitness",
    slug: "apex-fitness",
    industry_type: "service",
    address: "505 Iron Avenue, Muscle Beach",
    rating: 4.9,
    review_count: 210,
    description: "Modern fitness facility with premium weights, cardio equipment, and expert personal trainers."
  },
  {
    id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e12",
    name: "Sparkle Auto Detailing",
    slug: "sparkle-auto",
    industry_type: "service",
    address: "14 Engine Lane, Auto Park",
    rating: 4.6,
    review_count: 104,
    description: "Interior deep cleaning, exterior foam washes, ceramic coating, and paint correction."
  }
];

const mockServices = [
  // 1. Healthcare
  { business_id: "39c9c5b9-83b0-4a5b-901d-55166db8dc10", name: "General Checkup", description: "Standard wellness assessment and consultation.", price: 1500.00, duration_minutes: 30, category: "Consultation" },
  { business_id: "39c9c5b9-83b0-4a5b-901d-55166db8dc10", name: "Dental Cleanup & Scan", description: "Full dental clean, scaling, and digital X-ray diagnostics.", price: 2500.00, duration_minutes: 60, category: "Dental" },
  { business_id: "b2c9c5b9-83b0-4a5b-901d-55166db8dc11", name: "Teeth Whitening Session", description: "Laser teeth whitening for instant shine.", price: 4999.00, duration_minutes: 45, category: "Cosmetic" },
  { business_id: "b2c9c5b9-83b0-4a5b-901d-55166db8dc11", name: "Orthodontic Consultation", description: "Braces and aligners evaluation.", price: 1200.00, duration_minutes: 30, category: "Consultation" },

  // 2. Restaurant
  { business_id: "31fe3cc4-293c-4380-94e1-a56207d8c479", name: "Chef's Tasting Menu (2 Pax)", description: "A premium 5-course curated Italian culinary journey.", price: 3499.00, duration_minutes: 90, category: "Experience" },
  { business_id: "31fe3cc4-293c-4380-94e1-a56207d8c479", name: "Private Table Booking", description: "Reserve our exclusive candlelight terrace table.", price: 1000.00, duration_minutes: 120, category: "Reservation" },
  { business_id: "a2fe3cc4-293c-4380-94e1-a56207d8c480", name: "Omakase Experience", description: "Premium chef's choice selection of fresh seasonal sushi.", price: 5000.00, duration_minutes: 90, category: "Experience" },
  { business_id: "a2fe3cc4-293c-4380-94e1-a56207d8c480", name: "Sushi Platter (Family)", description: "Large platter containing 40 assorted premium rolls.", price: 2499.00, duration_minutes: 30, category: "Platter" },

  // 3. Cafe
  { business_id: "a3f5b9d2-1c2d-4e5f-8a9b-0c1d2e3f4a5b", name: "Barista Workshop", description: "Learn latte art, espresso extraction, and bean selection.", price: 1500.00, duration_minutes: 90, category: "Workshop" },
  { business_id: "a3f5b9d2-1c2d-4e5f-8a9b-0c1d2e3f4a5b", name: "Co-Working Seat Reservation", description: "Guaranteed desk space with high-speed internet and complimentary drip coffee.", price: 499.00, duration_minutes: 240, category: "Workspace" },
  { business_id: "c2f5b9d2-1c2d-4e5f-8a9b-0c1d2e3f4a5c", name: "Coffee Cupping & Tasting", description: "Taste and evaluate 6 single-origin specialty coffees.", price: 899.00, duration_minutes: 60, category: "Tasting" },
  { business_id: "c2f5b9d2-1c2d-4e5f-8a9b-0c1d2e3f4a5c", name: "Espresso Extraction Masterclass", description: "Perfect your home extraction techniques.", price: 1999.00, duration_minutes: 120, category: "Workshop" },

  // 4. Education
  { business_id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a", name: "Mathematics Private Tutoring", description: "Grade 8-12 algebra, calculus, and geometry tutoring.", price: 800.00, duration_minutes: 60, category: "Tutoring" },
  { business_id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a", name: "SAT Prep Crash Course", description: "Intensive exam strategy, practice papers, and verbal prep.", price: 4999.00, duration_minutes: 180, category: "Exam Prep" },
  { business_id: "e2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9b", name: "React & Next.js Crash Course", description: "Learn modern frontend development from scratch.", price: 8999.00, duration_minutes: 360, category: "Bootcamp" },
  { business_id: "e2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9b", name: "Python Coding Intro (Youth)", description: "Beginner programming course for school students.", price: 2999.00, duration_minutes: 90, category: "Kids Course" },

  // 5. Hospitality
  { business_id: "d1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9c", name: "Deluxe King Room Stay", description: "1-night stay in our high-floor King Room with city skyline views.", price: 7999.00, duration_minutes: 1440, category: "Stay" },
  { business_id: "d1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9c", name: "Rooftop Pool Daypass", description: "Single-day pool access with mocktail and gym access.", price: 1999.00, duration_minutes: 480, category: "Wellness" },
  { business_id: "d2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9d", name: "Forest Cabin Night Stay", description: "1-night stay in a private wooden cabin with personal fireplace.", price: 5499.00, duration_minutes: 1440, category: "Stay" },
  { business_id: "d2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9d", name: "Guided Mountain Hike", description: "Scenic 3-hour hike with local naturalist guide.", price: 1200.00, duration_minutes: 180, category: "Activity" },

  // 6. Retail
  { business_id: "f1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9e", name: "Personal Styling Session", description: "1-hour curation of outfits by an in-house fashion specialist.", price: 1500.00, duration_minutes: 60, category: "Fashion Service" },
  { business_id: "f1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9e", name: "Tailored Fit Suit Measurement", description: "Precise tailor measurements for bespoke suit ordering.", price: 1000.00, duration_minutes: 45, category: "Bespoke" },
  { business_id: "f2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9f", name: "Smart Home Tech Consultation", description: "In-store layout planning for automation, lighting, and sound systems.", price: 1200.00, duration_minutes: 60, category: "Tech Planning" },
  { business_id: "f2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9f", name: "Custom Desktop Build Service", description: "Hardware assembly, bios flash, cabling, and stress testing.", price: 3000.00, duration_minutes: 120, category: "Hardware" },

  // 7. Real Estate
  { business_id: "c1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa1", name: "Luxury Apartment Showing", description: "Guided viewing tour of high-end downtown penthouses.", price: 500.00, duration_minutes: 60, category: "Viewing" },
  { business_id: "c1e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa1", name: "Property Valuation Assessment", description: "Complete market evaluation report for residential listings.", price: 4500.00, duration_minutes: 90, category: "Valuation" },
  { business_id: "c2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa2", name: "Tenant Placement Screening", description: "Thorough credit check, background check, and reference verification.", price: 2000.00, duration_minutes: 120, category: "Property Management" },
  { business_id: "c2e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa2", name: "Rental Valuation Consultation", description: "Strategic review of neighborhood rents to optimize pricing.", price: 1500.00, duration_minutes: 45, category: "Consulting" },

  // 8. Manufacturing
  { business_id: "b115f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa3", name: "CNC Machining Consultation", description: "CAD file review and setup planning for aluminum/steel parts.", price: 2000.00, duration_minutes: 45, category: "CAD Services" },
  { business_id: "b115f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa3", name: "3D Print Prototyping Run", description: "High-resolution PLA/PETG component printing.", price: 1500.00, duration_minutes: 240, category: "Prototyping" },
  { business_id: "b215f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa4", name: "Custom Injection Mold Design", description: "Feasibility review and engineering blueprinting for molds.", price: 5000.00, duration_minutes: 90, category: "Engineering" },
  { business_id: "b215f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa4", name: "Recycled Plastic Feasibility Study", description: "Analyze properties and suitability of recycled compounds.", price: 3500.00, duration_minutes: 60, category: "Testing" },

  // 9. Agriculture
  { business_id: "a115f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa5", name: "Guided Organic Farm Tour", description: "Walkthrough of produce tunnels, chicken coops, and soil prep.", price: 300.00, duration_minutes: 60, category: "Tour" },
  { business_id: "a115f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa5", name: "Home Gardening Masterclass", description: "Soil preparation, compost making, and pest control workshop.", price: 1200.00, duration_minutes: 120, category: "Workshop" },
  { business_id: "a215f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa6", name: "Premium Wine Tasting Session", description: "Tasting flights of 5 reserve wines paired with local cheese.", price: 1800.00, duration_minutes: 75, category: "Tasting" },
  { business_id: "a215f6a7-b8c9-0d1e-2f3a-4b5c6d7e8fa6", name: "Bespoke Grape Harvest Experience", description: "Join our crew for early morning harvest and crushing demonstrations.", price: 2500.00, duration_minutes: 180, category: "Experience" },

  // 10. Service
  { business_id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e11", name: "1-on-1 Personal Training Session", description: "Custom fitness program designed with an elite coach.", price: 1200.00, duration_minutes: 60, category: "Training" },
  { business_id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e11", name: "Body Composition Analysis", description: "Detailed skeletal muscle, fat mass, and metabolic analysis.", price: 799.00, duration_minutes: 20, category: "Diagnostics" },
  { business_id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e12", name: "Ceramic Paint Coating (Sedan)", description: "Premium exterior paint prep and 3-year ceramic protection coat.", price: 9999.00, duration_minutes: 360, category: "Detailing" },
  { business_id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e12", name: "Full Interior Steam Deepclean", description: "Dashboard steam sanitation, seat wash, vacuum, and odor elimination.", price: 2999.00, duration_minutes: 180, category: "Detailing" }
];

const mockBookings = [
  // Clinic bookings
  { business_id: "39c9c5b9-83b0-4a5b-901d-55166db8dc10", customer_name: "Rahul Sharma", customer_contact: "+91 98765 43210", booking_time: getFutureDateTime(1, 10), status: "confirmed" },
  { business_id: "39c9c5b9-83b0-4a5b-901d-55166db8dc10", customer_name: "Priya Patel", customer_contact: "+91 87654 32109", booking_time: getFutureDateTime(2, 14), status: "confirmed" },
  { business_id: "39c9c5b9-83b0-4a5b-901d-55166db8dc10", customer_name: "Amit Kumar", customer_contact: "+91 76543 21098", booking_time: getPastDateTime(1, 9), status: "completed" },
  
  // Bistro bookings
  { business_id: "31fe3cc4-293c-4380-94e1-a56207d8c479", customer_name: "Vikram Malhotra", customer_contact: "+91 99887 76655", booking_time: getFutureDateTime(0, 19), status: "confirmed" },
  { business_id: "31fe3cc4-293c-4380-94e1-a56207d8c479", customer_name: "Ananya Sen", customer_contact: "+91 91234 56789", booking_time: getPastDateTime(2, 20), status: "completed" },
  { business_id: "31fe3cc4-293c-4380-94e1-a56207d8c479", customer_name: "Karan Johar", customer_contact: "+91 92233 44556", booking_time: getFutureDateTime(3, 21), status: "cancelled" },

  // Gym bookings
  { business_id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e11", customer_name: "Sunny Deol", customer_contact: "+91 99999 88888", booking_time: getFutureDateTime(1, 7), status: "confirmed" },
  { business_id: "c8b6a12d-fa0a-4712-9c1b-e52701b22e11", customer_name: "Bobby Deol", customer_contact: "+91 88888 77777", booking_time: getPastDateTime(3, 8), status: "completed" }
];

function getFutureDateTime(daysAhead, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function getPastDateTime(daysAgo, hour) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

async function seed() {
  console.log("Starting comprehensive 10-industry DB seeding...");

  // 1. Seed Businesses (Upsert based on slug)
  for (const biz of mockBusinesses) {
    const { error } = await supabase
      .from("businesses")
      .upsert(biz, { onConflict: "slug" });
      
    if (error) {
      console.error(`Error seeding business ${biz.name}:`, error.message);
    } else {
      console.log(`✓ Business seeded: ${biz.name}`);
    }
  }

  // 2. Clear & Seed Services
  const bizIds = mockBusinesses.map(b => b.id);
  await supabase.from("services").delete().in("business_id", bizIds);

  const { error: servicesErr } = await supabase
    .from("services")
    .insert(mockServices);

  if (servicesErr) {
    console.error("Error seeding services:", servicesErr.message);
  } else {
    console.log("✓ Services successfully seeded.");
  }

  // 3. Clear & Seed Bookings
  await supabase.from("bookings").delete().in("business_id", bizIds);

  const { error: bookingsErr } = await supabase
    .from("bookings")
    .insert(mockBookings);

  if (bookingsErr) {
    console.error("Error seeding bookings:", bookingsErr.message);
  } else {
    console.log("✓ Bookings successfully seeded.");
  }

  console.log("Seeding complete! Check your local server.");
}

seed();
