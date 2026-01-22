import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, Bot, FileCheck, Sparkles, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GitBranch,
    title: "GitHub Integration",
    description: "Seamlessly sync issues from your GitHub repositories with one click. Real-time updates keep your workflow in sync.",
  },
  {
    icon: Bot,
    title: "AI-Powered Agents",
    description: "Builder and Reviewer agents collaborate to create perfect specifications through intelligent debate and iteration.",
  },
  {
    icon: FileCheck,
    title: "Export Anywhere",
    description: "Push approved specifications back to GitHub, export to your wiki, or download in multiple formats.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate comprehensive requirements in seconds, not hours. Accelerate your development workflow dramatically.",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Built with security and scalability in mind. Perfect for teams of any size, from startups to enterprises.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Reduce requirements writing time by 90%. Focus on building great products, not documentation.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">SpecSmith AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-6 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero dark:gradient-hero-dark -z-10" />
        
        <div className="container mx-auto text-center max-w-5xl relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 hover:bg-primary/15 transition-colors">
            <Bot className="w-4 h-4" />
            <span>Powered by Advanced AI Agents</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Automate Your Software{" "}
            <span className="text-gradient">
              Requirements
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            The AI-powered platform that transforms GitHub issues into production-ready specifications. Let our intelligent agents handle the heavy lifting.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup">
              <Button size="lg" className="bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium text-base px-8 h-12">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="font-medium text-base px-8 h-12 border-2">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="mt-8 text-sm text-muted-foreground">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 border-y border-border bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wider">
            Trusted by development teams worldwide
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-muted-foreground font-semibold text-xl">
                Company {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything you need to automate specifications
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              A complete platform for generating, reviewing, and exporting software requirements with AI precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="github-card group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your issues into comprehensive requirements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Connect Repository", desc: "Link your GitHub repository in seconds" },
              { step: "2", title: "Launch AI Agents", desc: "Our Builder and Reviewer agents analyze and debate" },
              { step: "3", title: "Export Results", desc: "Get polished requirements ready for development" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="github-card text-center p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to ship faster?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join development teams that are accelerating their workflow with AI-powered specifications.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium px-8 h-12">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary">
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="font-semibold">SpecSmith AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automate your software requirements with AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 SpecSmith AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
