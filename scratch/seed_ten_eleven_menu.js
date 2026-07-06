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

const menuItems = [
  // 1. Veg Burger
  { name: "Aloo Tikki Burger", price: 49, category: "Veg Burger", description: "Crispy aloo tikki patty with signature dressing, fresh lettuce and onions." },
  { name: "Masala Aloo Tikki Burger", price: 79, category: "Veg Burger", description: "Spicy masala aloo tikki patty with signature dressing, fresh veggies." },
  { name: "Aloo Cheese Burger", price: 89, category: "Veg Burger", description: "Crispy potato patty with cheese slice, fresh lettuce, and burger sauce." },
  { name: "Veggie Burger", price: 79, category: "Veg Burger", description: "Classic mix-veg patty with creamy mayonnaise, lettuce, and tomatoes." },
  { name: "King Burger", price: 89, category: "Veg Burger", description: "Large premium veg patty with extra veggies and special house sauce." },
  { name: "American Burger", price: 119, category: "Veg Burger", description: "Double patty burger with pickles, onions, mustard, and cheese." },
  { name: "Crispy Burger", price: 119, category: "Veg Burger", description: "Extra crunchy veg patty with spicy garlic mayo and fresh lettuce." },
  { name: "Surprise Burger", price: 109, category: "Veg Burger", description: "Mystery spicy patty with liquid cheese and double dressings." },
  { name: "Kurkura Burger", price: 109, category: "Veg Burger", description: "Crunchy kurkure-crusted patty with sweet chilli sauce and veggies." },
  { name: "Smokey Burger", price: 89, category: "Veg Burger", description: "Flame-grilled smokey veg patty with hickory barbeque sauce." },
  { name: "Chatpata Burger", price: 124, category: "Veg Burger", description: "Tangy and spicy green-chutney based veg burger with sliced paneer." },
  { name: "Paneer Cheese Burger", price: 139, category: "Veg Burger", description: "Crispy paneer block patty with cheese slice, rich mayo, and fresh lettuce." },
  { name: "Kurkura Paneer Burger", price: 129, category: "Veg Burger", description: "Crunchy kurkure-coated paneer block with spicy schezwan dressing." },
  { name: "Barbeque Burger", price: 119, category: "Veg Burger", description: "Classic grilled burger topped with smokehouse BBQ sauce and caramelized onion." },
  { name: "Cheese Lava Burger", price: 119, category: "Veg Burger", description: "Burger with a molten cheese center that oozes with every bite." },
  { name: "Barbeque Grilled Burger", price: 119, category: "Veg Burger", description: "Char-grilled veggie burger drizzled with smoky barbecue sauce." },
  { name: "Paneer Barbeque Grilled Burger", price: 139, category: "Veg Burger", description: "Char-grilled paneer burger drizzled with smoky barbecue sauce." },

  // 2. Maharaja Burger
  { name: "Maharaja Burger", price: 139, category: "Maharaja Burger", description: "Double decker giant veg burger loaded with premium patty and extra cheese." },
  { name: "Paneer Maharaja Burger", price: 149, category: "Maharaja Burger", description: "Double decker giant burger loaded with double paneer and extra cheese." },
  { name: "Smokey Grilled Maharaja Burger", price: 119, category: "Maharaja Burger", description: "Smoky char-grilled double decker maharaja burger." },

  // 3. Fries
  { name: "French Fries Small", price: 69, category: "Fries's", description: "Salted classic golden-fried potato fingers." },
  { name: "French Fries Large", price: 99, category: "Fries's", description: "Salted classic golden-fried potato fingers (large portion)." },
  { name: "Peri-Peri Fries", price: 89, category: "Fries's", description: "Golden fries tossed in spicy peri-peri seasoning." },
  { name: "Masala Fries", price: 109, category: "Fries's", description: "Crispy fries dusted with local chatpata masala mix." },
  { name: "Loaded Cheese Fries Small", price: 99, category: "Fries's", description: "Crispy fries smothered in warm liquid cheese sauce (small)." },
  { name: "Loaded Cheese Fries Large", price: 129, category: "Fries's", description: "Crispy fries smothered in warm liquid cheese sauce (large)." },

  // 4. Wrap
  { name: "Aloo Masala Wrap", price: 79, category: "Wrap", description: "Spiced mashed potato wrapped in soft tortilla with mint chutney." },
  { name: "Veg Chatpata Wrap", price: 89, category: "Wrap", description: "Tangy mix-veggie filling wrapped in a warm soft tortilla." },
  { name: "Paneer Wrap", price: 109, category: "Wrap", description: "Soft paneer cubes tossed in spices, wrapped with onions and peppers." },
  { name: "Cheese & Paneer Wrap", price: 119, category: "Wrap", description: "Delicious wrap stuffed with paneer and loaded with melted cheese." },
  { name: "Cheese & Mac Wrap", price: 109, category: "Wrap", description: "Cheesy macaroni pasta wrapped inside a toasted wrap." },
  { name: "Cheese Corn 'N' Wrap", price: 109, category: "Wrap", description: "Sweet corn and gooey mozzarella cheese wrap." },

  // 5. Sandwich
  { name: "Veg Mayo Sandwich", price: 59, category: "Sandwich", description: "Simple raw vegetable sandwich with creamy eggless mayonnaise." },
  { name: "Mayo Cheese Sandwich", price: 109, category: "Sandwich", description: "Creamy mayonnaise and cheese sandwich toasted to perfection." },
  { name: "Chatpata Veg Sandwich", price: 89, category: "Sandwich", description: "Toasted sandwich with tangy green chutney and spiced vegetable filling." },
  { name: "Corn Sandwich", price: 99, category: "Sandwich", description: "Sweet corn kernels mixed with mayo and cheese in toasted bread." },
  { name: "Ten 11 Special Sandwich", price: 139, category: "Sandwich", description: "House special double-layered loaded sandwich with paneer, corn, cheese, and veggies." },

  // 6. Pizza
  { name: "New Sandwich Pizza", price: 119, category: "Pizza", description: "Unique hybrid pizza sandwich topped with cheese and pizza sauce." },
  { name: "Veggie Pizza", price: 229, category: "Pizza", description: "Freshly baked pizza loaded with capsicum, onion, tomato, and mozzarella." },
  { name: "Cheese Pizza", price: 189, category: "Pizza", description: "Classic thin-crust pizza loaded with premium mozzarella cheese." },
  { name: "Paneer Pizza", price: 219, category: "Pizza", description: "Topped with marinated paneer tikka cubes, onions, and green peppers." },
  { name: "Corn Cheese Pizza", price: 199, category: "Pizza", description: "Simple and sweet corn with double mozzarella cheese." },
  { name: "Paneer Peprika Pizza", price: 229, category: "Pizza", description: "Spicy paneer, red paprika, and onions topped with mozzarella." },

  // 7. Sidies
  { name: "Veg Nuggets - 12Pc.", price: 109, category: "Sidies", description: "Twelve crispy bite-sized fried vegetable nuggets served with dip." },
  { name: "Veg Nuggets - 6Pc.", price: 69, category: "Sidies", description: "Six crispy bite-sized fried vegetable nuggets served with dip." },
  { name: "Pizza Pockets", price: 129, category: "Sidies", description: "Crispy fried pockets filled with cheese and tangy pizza sauce." },

  // 8. Pasta
  { name: "Indian Masala Pasta", price: 140, category: "Pasta", description: "Penne pasta cooked in a rich, spicy, Indian-style tomato masala sauce." },
  { name: "White Sauce Pasta", price: 160, category: "Pasta", description: "Penne pasta in a rich, creamy, and cheesy white alfredo sauce." },

  // 9. Maggi
  { name: "Veggie Maggi", price: 59, category: "Maggi", description: "Classic instant noodles cooked with chopped fresh vegetables and spices." },
  { name: "Corn Cheese Maggi", price: 69, category: "Maggi", description: "Maggi noodles loaded with sweet corn kernels and melted cheese." },
  { name: "Paneer Cheese Maggi", price: 79, category: "Maggi", description: "Creamy maggi noodles topped with paneer cubes and shredded cheese." },
  { name: "Loaded Paneer Maggi", price: 89, category: "Maggi", description: "Extra paneer, extra veggies, and special spice mix maggi." },
  { name: "Ten 11 Special Maggi", price: 99, category: "Maggi", description: "Our signature maggi loaded with double cheese, butter, paneer, and corn." },

  // 10. Rice
  { name: "Veggie Rice", price: 59, category: "Rice", description: "Fried rice tossed with fresh garden vegetables and mild spices." },
  { name: "Veggie Corn Rice", price: 69, category: "Rice", description: "Vegetable fried rice enhanced with sweet corn kernels." },
  { name: "Paneer Corn Rice", price: 79, category: "Rice", description: "Fried rice loaded with paneer cubes and sweet corn." },
  { name: "Paneer Veg Rice", price: 89, category: "Rice", description: "Healthy fried rice loaded with paneer and mix-veggies." },
  { name: "Sechwan Rice", price: 99, category: "Rice", description: "Spicy fried rice tossed in fiery schezwan sauce and vegetables." },

  // 11. Combo's+Meal's
  { name: "Veggie Combo (2 Burger)", price: 139, category: "Combo's+Meal;'s", description: "A combo of 2 classic veggie burgers." },
  { name: "Aloo Tikki + Fries + Coldrink", price: 129, category: "Combo's+Meal;'s", description: "Aloo Tikki burger served with golden fries and a cold drink." },
  { name: "King Burger + Fries + Coldrink", price: 150, category: "Combo's+Meal;'s", description: "King burger served with golden fries and a cold drink." },
  { name: "Paneer Burger + Fries + Coldrink", price: 189, category: "Combo's+Meal;'s", description: "Paneer burger served with golden fries and a cold drink." },
  { name: "Maharaja Burger + Fries + Coldrink", price: 205, category: "Combo's+Meal;'s", description: "Maharaja burger served with golden fries and a cold drink." },
  { name: "Cheese Burger + Fries + Shake", price: 259, category: "Combo's+Meal;'s", description: "Cheese burger served with fries and a delicious milkshake." },

  // 12. Dessert
  { name: "Choco Lava Cake", price: 69, category: "Dessert", description: "Warm chocolate cake with a molten liquid chocolate center." },
  { name: "Nutella Sandwich", price: 89, category: "Dessert", description: "Toasted bread pockets stuffed with rich Nutella chocolate spread." },
  { name: "Choco Lava with Ice Cream", price: 89, category: "Dessert", description: "Warm choco lava cake served with a scoop of vanilla ice cream." },
  { name: "Brownie Factory", price: 120, category: "Dessert", description: "Rich chocolate brownie served with warm chocolate fudge sauce." },

  // 13. Extra
  { name: "Dip", price: 20, category: "Extra", description: "Extra dipping sauce." },
  { name: "Mayo Dip", price: 20, category: "Extra", description: "Extra creamy mayonnaise dip." },
  { name: "Cheese Dip", price: 20, category: "Extra", description: "Extra rich liquid cheese dip." },
  { name: "Extra Cheese", price: 25, category: "Extra", description: "Add an extra slice or layer of cheese." }
];

async function seed() {
  console.log("Searching for Ten Eleven business...");

  // Query database for businesses
  const { data: businesses, error: bizError } = await supabase
    .from("businesses")
    .select("id, name, slug");

  if (bizError) {
    console.error("Error fetching businesses:", bizError.message);
    process.exit(1);
  }

  // Find business matching "ten" or "11" or "eleven"
  const tenEleven = businesses.find(b => 
    b.name.toLowerCase().includes("ten") || 
    b.name.toLowerCase().includes("11") ||
    b.name.toLowerCase().includes("eleven") ||
    b.slug.toLowerCase().includes("ten") ||
    b.slug.toLowerCase().includes("11")
  );

  if (!tenEleven) {
    console.error("Could not find the 'Ten Eleven' business in the database. Found businesses:", businesses);
    process.exit(1);
  }

  console.log(`Found business: ${tenEleven.name} (ID: ${tenEleven.id})`);

  // Delete existing services for this business to avoid duplication
  console.log("Cleaning up old services...");
  const { error: delError } = await supabase
    .from("services")
    .delete()
    .eq("business_id", tenEleven.id);

  if (delError) {
    console.error("Error deleting old services:", delError.message);
  }

  // Map services to business_id and add default duration (10 mins for burgers/sides, 15 for pizza/combos, 5 for dessert/extras)
  const servicesToInsert = menuItems.map(item => {
    let duration = 10;
    if (item.category === "Pizza" || item.category === "Combo's+Meal;'s") duration = 15;
    else if (item.category === "Dessert") duration = 5;
    else if (item.category === "Extra") duration = 1;

    return {
      business_id: tenEleven.id,
      name: item.name,
      description: item.description,
      price: item.price,
      duration_minutes: duration,
      category: item.category,
      is_active: true
    };
  });

  console.log(`Inserting ${servicesToInsert.length} menu items...`);
  const { data: inserted, error: insError } = await supabase
    .from("services")
    .insert(servicesToInsert)
    .select();

  if (insError) {
    console.error("Error inserting menu items:", insError.message);
    process.exit(1);
  }

  console.log(`✓ Successfully seeded ${inserted.length} menu items for ${tenEleven.name}!`);
}

seed();
