# Multi-Tenant Business & Booking SaaS Platform

A modern, multi-tenant marketplace SaaS that enables businesses (restaurants, cafes, clinics, schools) to set up storefronts and customers to discover them, book slots/tables, and manage bookings in real time.

---

## 🚀 Tech Stack
* **Framework**: Next.js 15 (App Router, Turbopack)
* **Backend Database & Auth**: Supabase (PostgreSQL, Client-side Auth, Realtime PG Subscriptions)
* **Styling & UI**: Tailwind CSS (Minimal, High-Contrast Light Mode)
* **Animations**: Framer Motion
* **QR Codes**: `qrcode.react`
* **Icons**: Lucide React

---

## 🌟 Key Features Implemented

### 1. Geolocation & Real-Time Discovery
* **HTML5 Geolocation API**: Queries the browser coordinates on load to detect customer location.
* **OSM Nominatim Reverse-Geocoding**: Translates coordinates dynamically into city names (e.g. Hyderabad, Bengaluru) worldwide.
* **Supabase Realtime PostgreSQL Insert Listener**: Subscribes to new business registrations. When a new business registers, it instantly appears on nearby searchers' feeds with a toast notification banner.
* **Nearby / Show All Toggle**: Allows browsing only local businesses or toggling globally.

### 2. Industry-Specific Reservation Constraints
* **Clinics & Services**: 15-minute slot allocation engine (9:00 AM – 5:00 PM).
* **Restaurants & Cafes**: Restricted slots at peak times (9:00 AM – 11:00 AM and 8:00 PM – 10:00 PM) with 30-minute interval gaps.
* **Double-Booking Prevention**: Live polling checks active bookings every 8 seconds, dynamically disabling occupied slots/tables and validating on submission.

### 3. Customer Profile Dashboard (`/profile`)
* **Profile Details**: Name, Phone, and digital Passes (Medical allergies, dietary preferences).
* **My Bookings Feed**: Grouped by Upcoming vs. Past History. Includes Live cancel hooks and Reschedule modals.
* **Dynamic QR Code Pass**: Renders a dynamic vector QR code pass containing the booking ID for admin check-in.
* **Preferences Workspace**: Toggles SMS vs. Email notification updates and default search filters.
* **Help & Support Workspace**: Standard ticketing form syncing directly with your database.

---

## 🛠️ Database Setup (Supabase)

### 1. Create Support Tickets Table
Ensure you run this SQL in your **Supabase SQL Editor** to enable the support ticket system:

```sql
CREATE TABLE public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Add Policies
CREATE POLICY "Enable insert for authenticated users" 
ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable select for ticket creators" 
ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

### 2. Enable Realtime Replication
To support the live explore dashboard inserts, you must enable replication for the `businesses` table:
1. Go to **Supabase Dashboard** -> **Database** -> **Replication**.
2. Under `supabase_realtime` publication, click **Source**.
3. Toggle the **businesses** table to **Active**.

---

## 💻 Local Development

### 1. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 2. Run the Application
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Production Deployment (Vercel)

1. Push the code to a Git repository (GitHub / GitLab).
2. Go to Vercel, click **New Project**, and import your repository.
3. In Vercel Project Settings, add these environment variables:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will build the Next.js static and server routes automatically.
