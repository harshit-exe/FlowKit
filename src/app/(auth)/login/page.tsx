"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Something went wrong with social login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.png')] bg-[size:60px_60px] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-20" />
      </div>
      
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 text-white relative z-10 shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 relative">
               {/* Placeholder for Logo if needed, or just use text */}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-poppins tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription className="font-mono text-gray-400 text-base">
            Continue your automation journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleSocialLogin("github")}
              disabled={isLoading}
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all h-12"
            >
              <Github className="mr-2 h-5 w-5" />
              GitHub
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all h-12"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-2 text-gray-500 font-mono tracking-widest">Or via email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-mono uppercase text-gray-400">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password"className="text-xs font-mono uppercase text-gray-400">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold font-mono h-11 mt-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-gray-500 font-mono w-full text-center">
            New to FlowKit?{" "}
            <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors">
              Create an account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
