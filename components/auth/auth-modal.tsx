"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon, AppleIcon } from "@/components/auth/oauth-icons";
import { createClient } from "@/lib/supabase/client";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function redirectTo() {
  return `${window.location.origin}/auth/callback`;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [loading, setLoading] = useState<null | "google" | "apple" | "email">(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading("google");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  };

  const handleApple = async () => {
    setLoading("apple");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  };

  const handleEmail = async (e: FormEvent<HTMLFormElement>, mode: "signin" | "signup") => {
    e.preventDefault();
    setLoading("email");
    setError(null);
    const supabase = createClient();
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(null);
      } else {
        onOpenChange(false);
        setLoading(null);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(null);
      } else {
        onOpenChange(false);
        setLoading(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            Welcome to NaijaFast
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to track your meals and fasting
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5">
          <Button
            variant="outline"
            size="lg"
            className="w-full bg-background"
            onClick={handleGoogle}
            disabled={loading !== null}
          >
            {loading === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            Continue with Google
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full bg-background"
            onClick={handleApple}
            disabled={loading !== null}
          >
            {loading === "apple" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <AppleIcon className="size-4" />
            )}
            Continue with Apple
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => handleEmail(e, "signin")}
            >
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading !== null}>
                {loading === "email" ? <Loader2 className="size-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => handleEmail(e, "signup")}
            >
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading !== null}>
                {loading === "email" ? <Loader2 className="size-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
