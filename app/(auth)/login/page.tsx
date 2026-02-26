"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <Card className="w-full max-w-md border-border/80">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Access dashboard metrics, products, and stock transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setErrorMessage(null);
            setPending(true);

            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") ?? "").trim();
            const password = String(formData.get("password") ?? "").trim();

            if (!email || !password) {
              setErrorMessage("Enter both email and password to continue.");
              setPending(false);
              return;
            }

            const { error } = await authClient.signIn.email({
              email,
              password,
            });

            if (error) {
              setErrorMessage(error.message ?? "Invalid email or password.");
              setPending(false);
              return;
            }

            router.push("/dashboard");
            router.refresh();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="admin@warehouse.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="********"
              required
            />
          </div>
          {errorMessage ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorMessage}
            </p>
          ) : null}
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Need an account?{" "}
          <Link className="font-semibold text-primary hover:underline" href="/signup">
            Create one
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
