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
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles list:");
    console.log(JSON.stringify(profiles, null, 2));
  }

  const { data: businesses, error: bizError } = await supabase
    .from("businesses")
    .select("*");

  if (bizError) {
    console.error("Error fetching businesses:", bizError);
  } else {
    console.log("Businesses list:");
    console.log(JSON.stringify(businesses, null, 2));
  }
}

run();
