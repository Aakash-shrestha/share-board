"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
}

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const router = useRouter();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  //profie picture state
  const [profilePicture, setProfilePicture] = useState<string | null>(
    user.profilePicture,
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError(false);

    if (newPassword.length < 6) {
      setPasswordMsg("New password must be at least 6 characters");
      setPasswordError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match");
      setPasswordError(true);
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg(data.error || "Failed to update password");
        setPasswordError(true);
        return;
      }
      setPasswordMsg("Password updated successfully");
      setPasswordError(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg("Network error");
      setPasswordError(true);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("userId", user.id);

      const res = await fetch("/api/profile/picture", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setProfilePicture(data.profilePicture);
      }
    } catch {
      console.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePicture = async () => {
    try {
      const res = await fetch("/api/profile/picture", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        setProfilePicture(null);
      }
    } catch {
      console.error("Failed to remove profile picture");
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle,#d1d5db_1px,transparent_1px)] bg-size-[20px_20px]" />

      <header className="border-b border-border px-8 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
              S
            </div>
            <span className="text-sm font-semibold tracking-tight">
              ShareBoard
            </span>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-8 py-10">
        {/* Profile Picture Section */}
        <section className="mb-10">
          <h2 className="mb-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Profile
          </h2>
          <div className="flex items-center gap-6 border border-border bg-card p-6">
            <div className="relative">
              {profilePicture ? (
                <Image
                  src={profilePicture}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading
                    ? "Uploading..."
                    : profilePicture
                      ? "Change Picture"
                      : "Upload Picture"}
                </Button>
                {profilePicture && (
                  <Button size="sm" variant="outline" onClick={removePicture}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Change Password Section */}
        <section className="mb-10">
          <h2 className="mb-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Change Password
          </h2>
          <div className="border border-border bg-card p-6">
            <form
              onSubmit={handlePasswordChange}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
              </div>

              {passwordMsg && (
                <div
                  className={`border px-3 py-2 text-xs ${
                    passwordError
                      ? "border-border bg-muted text-foreground"
                      : "border-border bg-muted text-foreground"
                  }`}
                >
                  {passwordMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={savingPassword}
                className="w-full"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
