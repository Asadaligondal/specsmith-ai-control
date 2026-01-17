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

interface AppHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function AppHeader({ isDark, toggleTheme }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
      {/* Active Project */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">E-Commerce V1</span>
          <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
            Active
          </Badge>
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
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Sarah Chen</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
