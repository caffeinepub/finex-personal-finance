import { Outlet } from '@tanstack/react-router';
import SidebarNav from './SidebarNav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarNav />
        <SidebarInset className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
