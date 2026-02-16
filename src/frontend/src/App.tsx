import { useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CalendarPage from './pages/CalendarPage';
import CategoriesPage from './pages/CategoriesPage';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import AccessDeniedScreen from './components/auth/AccessDeniedScreen';
import { createRouter, RouterProvider, createRoute, createRootRoute } from '@tanstack/react-router';

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AccessDeniedScreen />;
  }

  return (
    <>
      <AppLayout />
      {showProfileSetup && <ProfileSetupDialog />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transaksi',
  component: TransactionsPage
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kalender',
  component: CalendarPage
});

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kategori',
  component: CategoriesPage
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  transactionsRoute,
  calendarRoute,
  categoriesRoute
]);

const router = createRouter({ routeTree });

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
