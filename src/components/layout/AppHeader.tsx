import { Moon, Sun, GitBranch, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface AppHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function AppHeader({ isDark, toggleTheme }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [repoName, setRepoName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRepoName(null);
      return;
    }

    const load = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data());

        const settingsRef = doc(db, "users", user.uid, "settings", "integrations");
        const sSnap = await getDoc(settingsRef);
        if (sSnap.exists()) {
          const s: any = sSnap.data();
          if (s.repoUrl) {
            const parts = s.repoUrl.replace(/\.git$/i, "").split("/");
            setRepoName(parts.slice(-2).join("/"));
          }
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [user]);

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
      {/* Active Project */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{repoName ?? "E-Commerce V1"}</span>
          <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">Active</Badge>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${(profile?.name ?? user?.email ?? 'user')}`} />
                <AvatarFallback>{((profile?.name ?? user?.email ?? "").split(" ").map((n:any)=>n[0]).slice(0,2).join(""))}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{profile?.name ?? user?.email ?? "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={() => signOut && signOut()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
