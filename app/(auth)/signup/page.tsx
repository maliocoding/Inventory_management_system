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

export default function SignupPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <Card className="w-full max-w-md border-border/80">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Register warehouse staff access for inventory tracking.
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
            const name = String(formData.get("name") ?? "").trim();
            const email = String(formData.get("email") ?? "").trim();
            const password = String(formData.get("password") ?? "").trim();

            if (!name || !email || !password) {
              setErrorMessage("Name, email, and password are required.");
              setPending(false);
              return;
            }

            const { error } = await authClient.signUp.email({
              name,
              email,
              password,
            });

            if (error) {
              setErrorMessage(error.message ?? "Unable to create account.");
              setPending(false);
              return;
            }

            router.push("/dashboard");
            router.refresh();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input id="signup-name" name="name" placeholder="Warehouse Admin" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="admin@warehouse.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
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
            {pending ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Already registered?{" "}
          <Link className="font-semibold text-primary hover:underline" href="/login">
            Sign in
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
