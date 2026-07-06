import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { messages, businessName, businessType, businessSlug, role = "customer" } = await request.json();

  // Fetch real business data for context-aware responses
  let businessContext = "";
  let statsObj = { revenue: 0, bookings: 0, services: 0 };

  try {
    const query = supabase.from("businesses").select("*");
    
    let business = null;
    if (businessSlug) {
      const { data } = await query.eq("slug", businessSlug).single();
      business = data;
    }
    
    if (!business && businessName && businessName !== "Dashboard") {
      const { data } = await query.eq("name", businessName).single();
      business = data;
    }

    // Fallback if role is admin and no direct business match, select the first business for context
    if (!business && role === "admin") {
      const { data } = await supabase.from("businesses").select("*").limit(1);
      business = data?.[0];
    }

    if (business) {
      if (role === "admin") {
        // Fetch active services count
        const { count: activeServices } = await supabase
          .from("services")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business.id)
          .eq("is_active", true);

        // Fetch all bookings to calculate exact revenue and bookings count
        const { data: allBookings } = await supabase
          .from("bookings")
          .select("customer_contact, status")
          .eq("business_id", business.id);

        let totalRevenue = 0;
        let totalReservations = 0;
        if (allBookings) {
          allBookings.forEach((b) => {
            if (b.customer_contact?.startsWith("BILL|")) {
              try {
                const parts = b.customer_contact.split("|");
                const amt = parseFloat(parts[2]) || 0;
                totalRevenue += amt;
              } catch (e) {}
            } else {
              totalReservations += 1;
            }
          });
        }

        // Fetch 5 most recent bookings
        const { data: recentBookings } = await supabase
          .from("bookings")
          .select("customer_name, booking_time, status")
          .eq("business_id", business.id)
          .order("booking_time", { ascending: false })
          .limit(5);

        // Populate stats for the fallback engine
        statsObj = {
          revenue: totalRevenue,
          bookings: totalReservations,
          services: activeServices || 0
        };

        const parts: string[] = [];
        parts.push(`Business Name: ${business.name}`);
        parts.push(`Industry: ${business.industry_type || businessType}`);
        parts.push(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
        parts.push(`Total Bookings Count: ${totalReservations}`);
        parts.push(`Active Services Count: ${activeServices || 0}`);
        if (recentBookings && recentBookings.length > 0) {
          parts.push("\nRecent Bookings list:");
          for (const b of recentBookings) {
            parts.push(`  - Customer: ${b.customer_name} | Time: ${new Date(b.booking_time).toLocaleString()} | Status: ${b.status}`);
          }
        } else {
          parts.push("\nNo recent bookings records.");
        }
        businessContext = parts.join("\n");
      } else {
        // Fetch context for customer storefront
        const { count: servicesCount } = await supabase
          .from("services")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business.id)
          .eq("is_active", true);

        // Populate stats for the fallback engine
        statsObj = {
          revenue: 0,
          bookings: 0,
          services: servicesCount || 0
        };

        const parts: string[] = [];
        parts.push(`Business Name: ${business.name}`);
        parts.push(`Industry: ${business.industry_type || businessType}`);
        if (business.address) parts.push(`Address: ${business.address}`);
        if (business.phone) parts.push(`Phone: ${business.phone}`);
        if (business.email) parts.push(`Email: ${business.email}`);
        if (business.description) parts.push(`Description: ${business.description}`);

        // Fetch services
        const { data: services } = await supabase
          .from("services")
          .select("name, description, price, duration_minutes, category")
          .eq("business_id", business.id)
          .eq("is_active", true);

        if (services && services.length > 0) {
          parts.push("\nAvailable Services:");
          for (const s of services) {
            parts.push(`  - ${s.name} (${s.category}): ₹${s.price} | ${s.duration_minutes} min${s.description ? " — " + s.description : ""}`);
          }
        } else {
          parts.push("\nNo services are currently listed.");
        }
        businessContext = parts.join("\n");
      }
    }
  } catch (err) {
    console.error("Chat API: Error fetching business context:", err);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key, return role-aware Bizi fallback replies
  if (!apiKey) {
    const userMessage = messages[messages.length - 1]?.content || "";
    return NextResponse.json({
      reply: getFallbackReply(userMessage, businessName, businessType, role, statsObj),
    });
  }

  // Build system prompts that guide responses but permit general chat queries
  let systemPrompt = "";
  if (role === "admin") {
    systemPrompt = `You are "Bizi", the official AI Admin Co-Pilot for the "${businessName}" dashboard.
Your job is to assist the business owner (admin) with running their business and understanding their dashboard metrics.
You have access to the following real-time dashboard context:

${businessContext || `Business Name: ${businessName}\nIndustry: ${businessType}\nNo details available.`}

INSTRUCTIONS:
- Answer dashboard and operations questions using the context data above.
- If asked about recent bookings or revenue, refer to the statistics in the context.
- Help them navigate: explain that they can manage services in "Services" tab, view all reservations under "Bookings" tab, configure business hours in "Settings" tab, and process bills in "Billing" tab.
- Be professional, warm, helpful, and concise (2-4 sentences).
- If the user asks general questions unrelated to the business, answer them politely and intelligently using your general knowledge, but try to relate it back to how it might help their business if possible.`;
  } else {
    systemPrompt = `You are "Bizi", the official AI Assistant for "${businessName}".
Your job is to assist customers who are viewing the business storefront page.
You have access to the following real, verified business data:

${businessContext || `Business Name: ${businessName}\nIndustry: ${businessType}\nNo additional details available.`}

INSTRUCTIONS:
- Answer customer questions accurately using ONLY the data above.
- When asked about services, list the actual services with their real prices and durations.
- When asked about location/address, provide the exact address from the data.
- When asked about contact info, provide the actual phone/email.
- If booking is needed, tell them to use the booking widget on the page.
- Keep responses concise (2-4 sentences). Be warm, professional, and helpful. Format prices with the ₹ symbol.
- If the user asks general questions unrelated to the business, answer them politely and intelligently using your general knowledge, and invite them to explore our services or book an appointment.`;
  }

  const geminiMessages = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })
  );

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Gemini API failed or rate-limited. Falling back to local Bizi engine. Error:", errText);
      const userMessage = messages[messages.length - 1]?.content || "";
      return NextResponse.json({
        reply: getFallbackReply(userMessage, businessName, businessType, role, statsObj),
      });
    }

    const data = await res.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.warn("Chat API error. Falling back to local Bizi engine. Error:", err);
    const userMessage = messages[messages.length - 1]?.content || "";
    return NextResponse.json({
      reply: getFallbackReply(userMessage, businessName, businessType, role, statsObj),
    });
  }
}

function getFallbackReply(
  userMessage: string,
  businessName: string,
  businessType: string,
  role: string,
  stats?: { revenue: number; bookings: number; services: number }
): string {
  const msg = userMessage.toLowerCase();
  const currentStats = stats || { revenue: 0, bookings: 0, services: 0 };

  // 1. Revenue & Money
  if (/(revenue|sale|money|earn|income|profit|bill|payment|transaction|cash|upi|card|made|make|sold|sales|finance|ledger)/i.test(msg)) {
    if (role === "admin") {
      return `Bizi here! Your business has generated a total revenue of ₹${currentStats.revenue.toFixed(2)} till now.`;
    }
    return `For billing and prices, we accept multiple payment options including cash, cards, and UPI. Scroll up to our Services menu for details.`;
  }

  // 2. Pricing & Cost
  if (/(price|cost|fee|rate|charge|pay|amount|rupee|how much|costly|cheap)/i.test(msg)) {
    return `Bizi here! You can see all our service prices listed on this page. Scroll up to the Services section for details.`;
  }

  // 3. Bookings & Reservations
  if (/(book|appointment|reserve|reservation|slot|seat|table|schedule|client|guest|customer|patient|visit|upcoming)/i.test(msg)) {
    if (role === "admin") {
      return `Bizi here! You have a total of ${currentStats.bookings} bookings in your dashboard. You can view all upcoming reservations directly in the "Bookings" page of your admin dashboard.`;
    }
    return `Hi! Bizi here. You can book directly using the booking widget on this page! Just fill in your details, pick a date and time slot, and confirm.`;
  }

  // 4. Hours & Timings
  if (/(hour|open|time|timing|close|when|schedule|day|weekday|weekend|morning|evening|night)/i.test(msg)) {
    return `Hi! Bizi here. ${businessName} is typically open Monday–Friday, 9 AM to 5 PM. For exact hours, please check the business details or settings.`;
  }

  // 5. Location & Address
  if (/(location|address|where|place|city|direction|map|street|located|find)/i.test(msg)) {
    return `Bizi here! Our address is shown at the top of the page. You can also find directions by clicking the address link.`;
  }

  // 6. Services & Products
  if (/(service|menu|item|treatment|course|product|offer|package|class|what do you do|what are the services)/i.test(msg)) {
    return `Bizi here! We offer a range of specialized services (we currently have ${currentStats.services} active services listed). You can view the full list with pricing and durations by scrolling to our Services section.`;
  }

  // 7. General Dashboard Stats
  if (/(stat|recent|dashboard|overview|report|metric)/i.test(msg)) {
    if (role === "admin") {
      return `Bizi here! Currently: Total revenue is ₹${currentStats.revenue.toFixed(2)}, you have ${currentStats.bookings} bookings, and ${currentStats.services} active services listed. You can manage everything right here.`;
    }
  }

  // 8. Greeting
  if (/(hello|hi|hey|greetings|howdy|sup|yo)/i.test(msg)) {
    if (role === "admin") {
      return `Hello Owner! I'm Bizi, your Admin Co-Pilot. How can I help you run ${businessName} today? Ask me about your bookings, revenue stats, or navigation.`;
    }
    return `Hello! Welcome to ${businessName}. I'm Bizi. How can I help you today? I can tell you about our services, pricing, or help with bookings.`;
  }

  // Fully relaxed general answers instead of blocking!
  if (role === "admin") {
    return `I can help you look into that! As Bizi, your dashboard co-pilot, I am ready to assist. Currently, your business has ₹${currentStats.revenue.toFixed(2)} in total revenue, ${currentStats.bookings} active bookings, and ${currentStats.services} services configured. You can edit services in the "Services" tab or view bills in the "Billing" tab.`;
  }
  return `Thanks for asking! I'm Bizi, the AI assistant for ${businessName}. I can answer questions about our services (we have ${currentStats.services} listed), hours, location, or help you with your booking. What would you like to know?`;
}
