"use client";

import { AlertCircle } from "lucide-react";
import { Field, controlClass } from "@/components/ui/field";
import { PasswordToggleButton } from "@/components/ui/password-toggle-button";

/** Bidang email dan password untuk halaman masuk (admin dan Assessment Center). */
export function AuthFields({
  email,
  onEmail,
  password,
  onPassword,
  showPassword,
  onTogglePassword,
  emailLabel,
  passwordLabel,
}: {
  email: string;
  onEmail: (v: string) => void;
  password: string;
  onPassword: (v: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  emailLabel: string;
  passwordLabel: string;
}) {
  return (
    <>
      <Field label={emailLabel} htmlFor="email">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          required
          autoComplete="username"
          className={controlClass}
          placeholder="example@example.com"
        />
      </Field>
      <Field label={passwordLabel} htmlFor="password">
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={`${controlClass} pr-12`}
            placeholder="••••••••"
          />
          <PasswordToggleButton visible={showPassword} onToggle={onTogglePassword} />
        </div>
      </Field>
    </>
  );
}

/** Pesan galat: ikon dan teks, bukan hanya warna. */
export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-status-danger-border bg-status-danger-bg p-4">
      <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-status-danger" />
      <p className="text-sm text-status-danger">{message}</p>
    </div>
  );
}
