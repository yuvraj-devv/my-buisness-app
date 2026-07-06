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

async function run() {
  const { data: businesses, error: bizError } = await supabase
    .from("businesses")
    .select("id, name, slug");

  if (bizError) {
    console.error("Error fetching businesses:", bizError.message);
    process.exit(1);
  }

  const tenEleven = businesses.find(b => 
    b.name.toLowerCase().includes("ten") || 
    b.name.toLowerCase().includes("11") ||
    b.name.toLowerCase().includes("eleven") ||
    b.slug.toLowerCase().includes("ten") ||
    b.slug.toLowerCase().includes("11")
  );

  if (!tenEleven) {
    console.error("Could not find Ten Eleven business.");
    process.exit(1);
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ logo_url: "/ten-eleven-logo.png" })
    .eq("id", tenEleven.id);

  if (updateError) {
    console.error("Error updating logo:", updateError.message);
  } else {
    console.log(`✓ Updated logo_url to '/ten-eleven-logo.png' for business: ${tenEleven.name}`);
  }
}

run();
