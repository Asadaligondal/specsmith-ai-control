import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, Bot, FileCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GitBranch,
    title: "GitLab Integration",
    description: "Sync issues instantly from your GitLab repositories with a single click.",
  },
  {
    icon: Bot,
    title: "Dual-Agent AI",
    description: "Builder and Reviewer agents debate to perfect your specifications.",
  },
  {
    icon: FileCheck,
    title: "One-Click Export",
    description: "Push approved specs back to GitLab or your wiki effortlessly.",
  },
];

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">SpecSmith AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Bot className="w-4 h-4" />
            <span>Powered by AI Agents</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Automate Your Specs.{" "}
            <span className="bg-gradient-to-r from-primary via-agent-builder to-agent-reviewer bg-clip-text text-transparent">
              Ship Faster.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The AI-powered bridge between GitLab issues and production code. Let our Builder and Reviewer agents write your requirements for you.
          </p>

          {/* CTA */}
          <Link to="/signup">
            <Button size="lg" className="gradient-primary text-primary-foreground text-lg px-8 py-6 h-auto">
              Get Started for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          {/* Trust indicators */}
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free tier available
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-border/50 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to automate specs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform for generating, reviewing, and exporting software requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to streamline your workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join teams that are shipping faster with AI-powered specifications.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gradient-primary text-primary-foreground">
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-md gradient-primary">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              © 2024 SpecSmith AI. All rights reserved.
            </span>
          </div>
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
