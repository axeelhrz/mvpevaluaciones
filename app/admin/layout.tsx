import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import SiteHeader from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userData = {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" userData={userData} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
