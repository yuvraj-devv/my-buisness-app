import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { createSupabaseServer } from "@/lib/supabase-server";
import { ChatWidget } from "@/components/chatbot/chat-widget";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, logo_url")
    .eq("owner_id", user?.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <AdminSidebar
        logoUrl={business?.logo_url}
        businessName={business?.name}
        user={user}
        profile={profile}
      />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
      <ChatWidget
        businessName={business?.name || "Dashboard"}
        businessType=""
        businessSlug=""
        role="admin"
      />
    </div>
  );
}
