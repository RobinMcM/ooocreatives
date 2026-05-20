"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Session from "supertokens-auth-react/recipe/session";
import { useUserRoles } from "@/lib/useUserRoles";

interface ProfileData {
  name: string | null;
  company: string | null;
  communicationEmail: string | null;
  username: string | null;
  phone: string | null;
  address: string | null;
  actorId: string | null;
  showAsCreative: boolean;
}

interface ActorCard {
  title?: string;
  bio?: string;
  bioUrl?: string;
  photoUrl?: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilePage() {
  const router = useRouter();
  const { roles } = useUserRoles();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contact details
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [communicationEmail, setCommunicationEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Opt-in
  const [showAsCreative, setShowAsCreative] = useState(false);

  // Creative profile
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) { router.push("/auth"); return; }
        const data = await res.json();
        const profile: ProfileData = data.profile;
        const actorCard: ActorCard | null = data.actorCard;

        if (profile) {
          setName(profile.name ?? "");
          setCompany(profile.company ?? "");
          setCommunicationEmail(profile.communicationEmail ?? "");
          setUsername(profile.username ?? "");
          setPhone(profile.phone ?? "");
          setAddress(profile.address ?? "");
          setShowAsCreative(profile.showAsCreative ?? false);
        }
        if (actorCard) {
          setTitle(actorCard.title ?? "");
          setBio(actorCard.bio ?? "");
          setWebsiteUrl(actorCard.bioUrl ?? "");
          setExistingPhotoUrl(actorCard.photoUrl ?? null);
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load profile."); setLoading(false); });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("company", company);
      fd.append("communicationEmail", communicationEmail);
      fd.append("username", username);
      fd.append("phone", phone);
      fd.append("address", address);
      fd.append("showAsCreative", showAsCreative ? "true" : "false");
      fd.append("title", title);
      fd.append("bio", bio);
      fd.append("websiteUrl", websiteUrl);
      if (photoFile) fd.append("photo", photoFile);

      const headers = await authHeaders();
      const res = await fetch("/api/profile", { method: "PUT", headers, body: fd });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile.");
      } else {
        const data = await res.json();
        if (data.actorCard?.photoUrl) setExistingPhotoUrl(data.actorCard.photoUrl);
        setPhotoFile(null);
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-ooo-slate/40 rounded w-1/3" />
          <div className="h-4 bg-ooo-slate/30 rounded w-2/3" />
          <div className="h-48 bg-ooo-slate/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-2xl font-semibold text-ooo-cream">My Profile</h1>
        {roles.length > 0 && (
          <div className="flex gap-1.5">
            {roles.map((role) => (
              <span
                key={role}
                className="text-xs px-2 py-0.5 rounded bg-ooo-slate text-ooo-accent border border-ooo-accent/30 font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-ooo-muted mb-8">Your contact details on the MovieShaker platform.</p>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Contact Details */}
        <section className="space-y-5">
          <h2 className="text-xs uppercase tracking-wide text-ooo-muted border-b border-ooo-slate/50 pb-2">
            Contact Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="name">Display Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="username">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="phone">Phone</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 000000"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="communicationEmail">Contact Email</label>
              <input id="communicationEmail" type="email" value={communicationEmail} onChange={(e) => setCommunicationEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="company">Company</label>
              <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="Company or agency"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="address">Address</label>
              <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
            </div>
          </div>
        </section>

        {/* Creatives Directory opt-in */}
        <section>
          <h2 className="text-xs uppercase tracking-wide text-ooo-muted border-b border-ooo-slate/50 pb-2 mb-4">
            Creatives Directory
          </h2>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" checked={showAsCreative} onChange={(e) => setShowAsCreative(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ooo-slate accent-ooo-accent focus:ring-2 focus:ring-ooo-accent shrink-0" />
            <span>
              <span className="block text-sm font-medium text-ooo-cream group-hover:text-ooo-accent transition-colors">
                Show me as a Creative on the Creatives page
              </span>
              <span className="block text-xs text-ooo-muted mt-0.5">
                Your name, bio, and photo will appear in the public Creatives directory.
              </span>
            </span>
          </label>
        </section>

        {/* Creative Profile */}
        <section className="space-y-5">
          <h2 className="text-xs uppercase tracking-wide text-ooo-muted border-b border-ooo-slate/50 pb-2">
            Creative Profile
          </h2>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-ooo-cream mb-1.5">
              Photo
              {existingPhotoUrl && (
                <span className="ml-2 text-xs text-ooo-muted font-normal">(leave blank to keep current)</span>
              )}
            </label>
            {existingPhotoUrl && (
              <div className="mb-3 w-20 h-20 relative rounded-lg overflow-hidden bg-ooo-slate">
                <Image src={existingPhotoUrl} alt="Current photo" fill className="object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-ooo-accent file:text-ooo-ink hover:file:bg-ooo-accent/90" />
            {photoFile && <p className="mt-1.5 text-xs text-ooo-muted">Selected: {photoFile.name}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="title">
              Title <span className="text-ooo-muted font-normal text-xs">(e.g. Actor, Director, Producer)</span>
            </label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Actor, Director, Producer"
              className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="bio">Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="A short biography shown on your Creative listing…"
              rows={4}
              className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm resize-none" />
          </div>

          {/* Portfolio link */}
          <div>
            <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="websiteUrl">
              Portfolio / Bio Link <span className="text-ooo-muted font-normal text-xs">(opens when photo is clicked)</span>
            </label>
            <input id="websiteUrl" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm" />
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-400 bg-green-900/20 border border-green-700/40 rounded px-3 py-2">
            Profile saved successfully.
          </p>
        )}

        <button type="submit" disabled={saving}
          className="px-6 py-2.5 rounded bg-ooo-accent text-ooo-ink font-medium text-sm hover:bg-ooo-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
