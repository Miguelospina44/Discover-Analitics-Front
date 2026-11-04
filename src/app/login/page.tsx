"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WarningCircle } from "@phosphor-icons/react";
import { DiscoverLogo } from "@/brand/DiscoverLogo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { copy } from "@/copy";
import { useAuth } from "@/lib/auth";
import { ApiError, DEMO_LOGINS } from "@/lib/types";

const showTrialAccounts = process.env.NODE_ENV !== "production";

const DEMO_ROLE_OPTIONS = [
  { value: "super_admin", label: copy.demo.roles.super_admin },
  { value: "collective", label: copy.demo.roles.collective },
  { value: "account_owner", label: copy.demo.roles.account_owner },
] as const;

export default function LoginPage() {
  const { token, ready, isDemo, login, enterDemo } = useAuth();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState("super_admin");

  useEffect(() => {
    if (ready && (token || isDemo)) router.replace("/");
  }, [ready, token, isDemo, router]);

  useEffect(() => {
    if (error) emailRef.current?.focus();
  }, [error]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(copy.errors.apiUnreachable);
    } finally {
      setPending(false);
    }
  }

  if (!ready || token || isDemo) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-[var(--space-page)]">
        <p className="page-kicker">{copy.loading}</p>
      </main>
    );
  }

  const selectedTrial = DEMO_LOGINS.find((demo) => demo.email === email)?.email ?? "";

  return (
    <main className="flex min-h-dvh items-center justify-center px-[var(--space-page)] py-12">
      <Card className="w-full max-w-[26.25rem] px-7 py-9">
        <DiscoverLogo variant="primary" />
        <div>
          <h1 className="page-title text-[1.65rem]">{copy.login.title}</h1>
          <p className="page-lead">{copy.login.intro}</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FieldGroup className="gap-5">
            {showTrialAccounts ? (
              <Field>
                <FieldLabel>{copy.login.demoHint}</FieldLabel>
                <ToggleGroup
                  type="single"
                  value={selectedTrial}
                  onValueChange={(value) => {
                    const demo = DEMO_LOGINS.find((item) => item.email === value);
                    if (!demo) return;
                    setEmail(demo.email);
                    setPassword(demo.password);
                    setError(null);
                  }}
                  spacing={2}
                  size="sm"
                  aria-label={copy.login.demoHint}
                >
                  {DEMO_LOGINS.map((demo) => (
                    <ToggleGroupItem key={demo.email} value={demo.email}>
                      {demo.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="login-email">{copy.login.email}</FieldLabel>
              <Input
                ref={emailRef}
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={Boolean(error)}
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">{copy.login.password}</FieldLabel>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={Boolean(error)}
                disabled={pending}
              />
            </Field>
          </FieldGroup>
          {error ? (
            <Alert variant="destructive">
              <WarningCircle size={16} weight="regular" aria-hidden />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2.5">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? copy.login.submitting : copy.login.submit}
            </Button>
            {!showDemoSelector ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={pending}
                onClick={() => setShowDemoSelector(true)}
              >
                {copy.login.preview}
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <Field>
                  <FieldLabel>{copy.login.previewView}</FieldLabel>
                  <p className="text-[length:var(--step-small)] leading-relaxed text-muted-foreground">
                    {copy.demo.viewHint}
                  </p>
                  <ToggleGroup
                    type="single"
                    value={selectedDemoRole}
                    onValueChange={(value) => value && setSelectedDemoRole(value)}
                    spacing={2}
                    size="sm"
                    aria-label={copy.login.previewView}
                  >
                    {DEMO_ROLE_OPTIONS.map((role) => (
                      <ToggleGroupItem key={role.value} value={role.value}>
                        {role.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowDemoSelector(false)}
                  >
                    {copy.login.previewBack}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                      enterDemo(selectedDemoRole);
                      router.replace("/");
                    }}
                  >
                    {copy.login.previewContinue}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </Card>
    </main>
  );
}
