import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from '../theme/ThemeToggle';
import LoginButton from '../auth/LoginButton';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

export default function Header() {
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1" />
      {userProfile && (
        <div className="hidden sm:block text-sm text-muted-foreground">
          Halo, <span className="font-medium text-foreground">{userProfile.name}</span>
        </div>
      )}
      <ThemeToggle />
      <LoginButton />
    </header>
  );
}
