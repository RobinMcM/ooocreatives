"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";

interface Actor {
  id: string;
  name: string;
  bio?: string;
  bioUrl?: string;
}

interface ProfileData {
  name: string | null;
  company: string | null;
  communicationEmail: string | null;
  username: string | null;
  phone: string | null;
  address: string | null;
  actorId: string | null;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [communicationEmail, setCommunicationEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [actorId, setActorId] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
        const data = await res.json();
        const profile: ProfileData = data.profile;
        setActors(data.actors ?? []);
        if (profile) {
          setName(profile.name ?? "");
          setCompany(profile.company ?? "");
          setCommunicationEmail(profile.communicationEmail ?? "");
          setUsername(profile.username ?? "");
          setPhone(profile.phone ?? "");
          setAddress(profile.address ?? "");
          setActorId(profile.actorId ?? "");
          // Pre-fill bio/website from linked actor card
          if (profile.actorId) {
            const linked = (data.actors as Actor[]).find((a) => a.id === profile.actorId);
            if (linked) {
              setBio(linked.bio ?? "");
              setWebsiteUrl(linked.bioUrl ?? "");
            }
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, [router]);

  // When actor selection changes, pre-fill bio/website from that actor
  const handleActorChange = (id: string) => {
    setActorId(id);
    if (id) {
      const selected = actors.find((a) => a.id === id);
      if (selected) {
        setBio(selected.bio ?? "");
        setWebsiteUrl(selected.bioUrl ?? "");
      }
    } else {
      setBio("");
      setWebsiteUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          company: company || null,
          communicationEmail: communicationEmail || null,
          username: username || null,
          phone: phone || null,
          address: address || null,
          actorId: actorId || null,
          bio: bio || null,
          websiteUrl: websiteUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile.");
      } else {
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

  const linkedActor = actorId ? actors.find((a) => a.id === actorId) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ooo-cream mb-1">My Profile</h1>
      <p className="text-sm text-ooo-muted mb-8">Your contact details on the MovieShaker platform.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Details */}
        <section className="space-y-5">
          <h2 className="text-xs uppercase tracking-wide text-ooo-muted border-b border-ooo-slate/50 pb-2">
            Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="name">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 000000"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="communicationEmail">
                Contact Email
              </label>
              <input
                id="communicationEmail"
                type="email"
                value={communicationEmail}
                onChange={(e) => setCommunicationEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company or agency"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="address">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
              />
            </div>
          </div>
        </section>

        {/* Creative Listing */}
        <section className="space-y-5">
          <h2 className="text-xs uppercase tracking-wide text-ooo-muted border-b border-ooo-slate/50 pb-2">
            Creative Profile
          </h2>
          <p className="text-xs text-ooo-muted">
            Link your account to your Creative listing. Bio and website saved here will update your public actor card.
          </p>

          <div>
            <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="actorId">
              My Creative Listing
            </label>
            <select
              id="actorId"
              value={actorId}
              onChange={(e) => handleActorChange(e.target.value)}
              className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
            >
              <option value="">— None —</option>
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {linkedActor && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="websiteUrl">
                  Website / Portfolio URL
                </label>
                <input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ooo-cream mb-1.5" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short biography shown on your Creative listing…"
                  rows={4}
                  className="w-full px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm resize-none"
                />
              </div>
            </div>
          )}
        </section>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-400 bg-green-900/20 border border-green-700/40 rounded px-3 py-2">
            Profile saved successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded bg-ooo-accent text-ooo-ink font-medium text-sm hover:bg-ooo-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
