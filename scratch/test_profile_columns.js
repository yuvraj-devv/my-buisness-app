import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing config");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const testCols = [
    "id",
    "role",
    "full_name",
    "email",
    "phone",
    "avatar_url",
    "medical_pass",
    "hospitality_pass",
    "preferences",
    "metadata"
  ];
  
  for (const col of testCols) {
    const { error } = await supabase.from("profiles").select(col).limit(1);
    if (error) {
      console.log(`Column '${col}': NOT AVAILABLE (${error.message})`);
    } else {
      console.log(`Column '${col}': AVAILABLE`);
    }
  }
}

run();
