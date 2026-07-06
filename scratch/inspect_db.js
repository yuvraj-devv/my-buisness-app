import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Inspecting DB...");
  
  // Try to inspect the bookings table columns by fetching a single row
  const { data: bookingRow, error: err1 } = await supabase
    .from("bookings")
    .select("*")
    .limit(1);

  if (err1) {
    console.error("Error fetching bookings:", err1.message);
  } else {
    console.log("Bookings columns:", bookingRow.length > 0 ? Object.keys(bookingRow[0]) : "No rows (empty table)");
    if (bookingRow.length > 0) {
      console.log("Booking example row:", bookingRow[0]);
    }
  }

  // Check if there are other tables by running some query or checking schemas if accessible
  // Let's check businesses columns
  const { data: bizRow, error: err2 } = await supabase
    .from("businesses")
    .select("*")
    .limit(1);

  if (err2) {
    console.error("Error fetching businesses:", err2.message);
  } else {
    console.log("Businesses columns:", bizRow.length > 0 ? Object.keys(bizRow[0]) : "No rows");
    if (bizRow.length > 0) {
      console.log("Business example row:", bizRow[0]);
    }
  }
  
  // Let's check services columns
  const { data: svcRow, error: err3 } = await supabase
    .from("services")
    .select("*")
    .limit(1);

  if (err3) {
    console.error("Error fetching services:", err3.message);
  } else {
    console.log("Services columns:", svcRow.length > 0 ? Object.keys(svcRow[0]) : "No rows");
  }
}

run();
