import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Sparkles, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: err?.message ?? "Unable to sign in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    toast({
      title: "GitHub OAuth",
      description: "GitHub authentication coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl">SpecSmith AI</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
          <p className="text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Card */}
        <div className="github-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-10"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium h-10"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* GitHub Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 font-medium"
            onClick={handleGitHubLogin}
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
          </Button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
