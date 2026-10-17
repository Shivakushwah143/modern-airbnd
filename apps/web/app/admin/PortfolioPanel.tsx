"use client";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from "react";
import type { Property } from "@modern-airbnd/contracts";
import { api } from "@/lib/api";
import { Icon } from "@/components/Icon";

type Run = (fn: () => Promise<void>, success?: string) => Promise<void>;
type Ask = (
  title: string,
  message: string,
  action: () => Promise<void>,
) => void;
type Slot = "team" | "testimonials" | "cases";
type Kind = "image" | "video";

type TeamRow = {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  photoUrl: string;
  sortOrder: number;
  isPublished: boolean;
};
type TestimonialRow = {
  id: string;
  ownerName: string;
  city: string;
  quote: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  consentConfirmed: boolean;
  consentRecordedAt: string | null;
  consentSource: string;
  sortOrder: number;
  isPublished: boolean;
};
type CaseRow = {
  id: string;
  propertyId: string | null;
  title: string;
  slug: string;
  city: string;
  summary: string;
  outcome: string;
  coverUrl: string;
  sortOrder: number;
  isPublished: boolean;
  property?: { id: string; name: string; slug: string } | null;
};
type Signature = {
  timestamp: number;
  public_id: string;
  overwrite: boolean;
  allowed_formats: string;
  type: string;
  signature: string;
  apiKey: string;
  cloudName: string;
};

const emptyTeam = {
  name: "",
  title: "",
  role: "",
  bio: "",
  photoUrl: "",
  sortOrder: 0,
  isPublished: true,
};
const emptyTestimonial = {
  ownerName: "",
  city: "",
  quote: "",
  mediaType: "IMAGE" as "IMAGE" | "VIDEO",
  mediaUrl: "",
  consentConfirmed: false,
  consentSource: "",
  sortOrder: 0,
  isPublished: false,
};
const emptyCase = {
  propertyId: "",
  title: "",
  city: "",
  summary: "",
  outcome: "",
  coverUrl: "",
  sortOrder: 0,
  isPublished: true,
};

function validateFile(kind: Kind, file: File) {
  const ok =
    kind === "image"
      ? ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
        file.size <= 10 * 1024 * 1024
      : ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) &&
        file.size <= 50 * 1024 * 1024;
  if (!ok)
    throw new Error(
      kind === "image"
        ? "Choose a JPEG, PNG or WebP image under 10 MB."
        : "Choose an MP4, WebM or MOV short video under 50 MB.",
    );
}

async function uploadSlot(slot: Slot, kind: Kind, file: File): Promise<string> {
  validateFile(kind, file);
  const s = await api<Signature>("/admin/portfolio/signature", {
    method: "POST",
    body: JSON.stringify({ slot, kind }),
  });
  const form = new FormData();
  form.set("file", file);
  form.set("timestamp", String(s.timestamp));
  form.set("public_id", s.public_id);
  form.set("overwrite", String(s.overwrite));
  form.set("allowed_formats", s.allowed_formats);
  form.set("type", s.type);
  form.set("signature", s.signature);
  form.set("api_key", s.apiKey);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${s.cloudName}/${kind}/upload`,
    { method: "POST", body: form, signal: AbortSignal.timeout(120000) },
  );
  const result = (await response.json()) as { secure_url?: string };
  if (!response.ok || !result.secure_url)
    throw new Error("Upload failed. Please retry.");
  return result.secure_url;
}

function PublishedToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function PortfolioPanel({ run, ask }: { run: Run; ask: Ask }) {
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadError, setLoadError] = useState("");

  const [teamDraft, setTeamDraft] = useState<
    (typeof emptyTeam & { id?: string }) | null
  >(null);
  const [testimonialDraft, setTestimonialDraft] = useState<
    (typeof emptyTestimonial & { id?: string }) | null
  >(null);
  const [caseDraft, setCaseDraft] = useState<
    (typeof emptyCase & { id?: string }) | null
  >(null);

  async function load() {
    try {
      const [t, ts, c, p] = await Promise.all([
        api<TeamRow[]>("/admin/portfolio/team"),
        api<TestimonialRow[]>("/admin/portfolio/testimonials"),
        api<CaseRow[]>("/admin/portfolio/cases"),
        api<Property[]>("/admin/properties"),
      ]);
      setTeam(t);
      setTestimonials(ts);
      setCases(c);
      setProperties(p);
      setLoadError("");
    } catch {
      setLoadError("The portfolio could not be loaded. Please retry.");
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function onPick(
    slot: Slot,
    kind: Kind,
    file: File | undefined,
    apply: (url: string) => void,
  ) {
    if (!file) return;
    await run(async () => {
      apply(await uploadSlot(slot, kind, file));
    }, "Media uploaded.");
  }

  const rowStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid var(--border)",
  };

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">OWNER PORTFOLIO</p>
          <h1>Portfolio</h1>
        </div>
        <button className="button secondary" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      <p className="muted small">
        Team members, owner testimonials with uploaded screenshots or short
        videos, and published case studies shown on the public portfolio pages.
      </p>
      {loadError && (
        <p className="notice error" role="alert">
          {loadError}
        </p>
      )}

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MANAGEMENT TEAM</p>
            <h2>Team members</h2>
          </div>
          <button
            className="button primary"
            onClick={() => setTeamDraft(teamDraft ? null : { ...emptyTeam })}
          >
            <Icon name="plus" /> {teamDraft?.id ? "Edit member" : "Add member"}
          </button>
        </div>
        {teamDraft && (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              const { id, ...body } = teamDraft;
              void run(async () => {
                await api(id ? `/admin/portfolio/team/${id}` : "/admin/portfolio/team", {
                  method: id ? "PATCH" : "POST",
                  body: JSON.stringify(body),
                });
                setTeamDraft(null);
                await load();
              }, "Team member saved.");
            }}
          >
            <div className="form-grid">
              <label>
                Name
                <input
                  required
                  maxLength={120}
                  value={teamDraft.name}
                  onChange={(e) =>
                    setTeamDraft({ ...teamDraft, name: e.target.value })
                  }
                />
              </label>
              <label>
                Title
                <input
                  maxLength={120}
                  value={teamDraft.title}
                  onChange={(e) =>
                    setTeamDraft({ ...teamDraft, title: e.target.value })
                  }
                />
              </label>
              <label>
                Role
                <input
                  maxLength={120}
                  value={teamDraft.role}
                  onChange={(e) =>
                    setTeamDraft({ ...teamDraft, role: e.target.value })
                  }
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  min={0}
                  max={99999}
                  value={teamDraft.sortOrder}
                  onChange={(e) =>
                    setTeamDraft({
                      ...teamDraft,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <label>
              Bio
              <textarea
                rows={3}
                maxLength={1000}
                value={teamDraft.bio}
                onChange={(e) =>
                  setTeamDraft({ ...teamDraft, bio: e.target.value })
                }
              />
            </label>
            <label>
              Photo URL
              <input
                type="url"
                maxLength={2000}
                placeholder="https://…"
                value={teamDraft.photoUrl}
                onChange={(e) =>
                  setTeamDraft({ ...teamDraft, photoUrl: e.target.value })
                }
              />
            </label>
            <p className="muted small">Upload a photo, or paste an image URL.</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                void onPick("team", "image", e.target.files?.[0], (url) =>
                  setTeamDraft((d) => (d ? { ...d, photoUrl: url } : d)),
                )
              }
            />
            <PublishedToggle
              checked={teamDraft.isPublished}
              disabled={false}
              onChange={(value) =>
                setTeamDraft({ ...teamDraft, isPublished: value })
              }
              label="Show on the public team page"
            />
            <div className="row-actions">
              <button className="button primary" type="submit">
                Save member
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() => setTeamDraft(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {team.map((m) => (
          <div key={m.id} style={rowStyle}>
            <div>
              <strong>{m.name}</strong>{" "}
              <span className="muted small">{m.title || m.role}</span>
              {!m.isPublished && <span className="badge draft">Draft</span>}
            </div>
            <div className="row-actions">
              <PublishedToggle
                checked={m.isPublished}
                disabled={false}
                onChange={(value) =>
                  void run(async () => {
                    await api(`/admin/portfolio/team/${m.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ isPublished: value }),
                    });
                    await load();
                  }, "Visibility updated.")
                }
                label="Published"
              />
              <button
                className="button secondary"
                onClick={() =>
                  setTeamDraft({
                    name: m.name,
                    title: m.title,
                    role: m.role,
                    bio: m.bio,
                    photoUrl: m.photoUrl,
                    sortOrder: m.sortOrder,
                    isPublished: m.isPublished,
                    id: m.id,
                  })
                }
              >
                Edit
              </button>
              <button
                className="button danger"
                onClick={() =>
                  ask(
                    "Remove team member?",
                    `${m.name} will be removed from the portfolio.`,
                    async () => {
                      await api(`/admin/portfolio/team/${m.id}`, {
                        method: "DELETE",
                      });
                      await load();
                    },
                  )
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!team.length && !loadError && (
          <p className="muted small">No team members yet.</p>
        )}
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OWNER TESTIMONIALS</p>
            <h2>Testimonials</h2>
          </div>
          <button
            className="button primary"
            onClick={() =>
              setTestimonialDraft(
                testimonialDraft ? null : { ...emptyTestimonial },
              )
            }
          >
            <Icon name="plus" />{" "}
            {testimonialDraft?.id ? "Edit testimonial" : "Add testimonial"}
          </button>
        </div>
        {testimonialDraft && (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              const { id, ...body } = testimonialDraft;
              void run(async () => {
                await api(
                  id
                    ? `/admin/portfolio/testimonials/${id}`
                    : "/admin/portfolio/testimonials",
                  { method: id ? "PATCH" : "POST", body: JSON.stringify(body) },
                );
                setTestimonialDraft(null);
                await load();
              }, "Testimonial saved.");
            }}
          >
            <div className="form-grid">
              <label>
                Owner name
                <input
                  required
                  maxLength={120}
                  value={testimonialDraft.ownerName}
                  onChange={(e) =>
                    setTestimonialDraft({
                      ...testimonialDraft,
                      ownerName: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                City
                <input
                  maxLength={80}
                  value={testimonialDraft.city}
                  onChange={(e) =>
                    setTestimonialDraft({
                      ...testimonialDraft,
                      city: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Media type
                <select
                  value={testimonialDraft.mediaType}
                  onChange={(e) =>
                    setTestimonialDraft({
                      ...testimonialDraft,
                      mediaType: e.target.value === "VIDEO" ? "VIDEO" : "IMAGE",
                    })
                  }
                >
                  <option value="IMAGE">Image / screenshot</option>
                  <option value="VIDEO">Short video</option>
                </select>
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  min={0}
                  max={99999}
                  value={testimonialDraft.sortOrder}
                  onChange={(e) =>
                    setTestimonialDraft({
                      ...testimonialDraft,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <label>
              Quote
              <textarea
                rows={3}
                maxLength={1000}
                value={testimonialDraft.quote}
                onChange={(e) =>
                  setTestimonialDraft({
                    ...testimonialDraft,
                    quote: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Media URL
              <input
                type="url"
                maxLength={2000}
                placeholder="https://…"
                value={testimonialDraft.mediaUrl}
                onChange={(e) =>
                  setTestimonialDraft({
                    ...testimonialDraft,
                    mediaUrl: e.target.value,
                  })
                }
              />
            </label>
            <p className="muted small">
              Upload the owner&rsquo;s real screenshot or short video, or paste
              a media URL.
            </p>
            <input
              type="file"
              accept={
                testimonialDraft.mediaType === "VIDEO"
                  ? "video/mp4,video/webm,video/quicktime"
                  : "image/jpeg,image/png,image/webp"
              }
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                void onPick(
                  "testimonials",
                  testimonialDraft.mediaType === "VIDEO" ? "video" : "image",
                  e.target.files?.[0],
                  (url) =>
                    setTestimonialDraft((d) => (d ? { ...d, mediaUrl: url } : d)),
                )
              }
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={testimonialDraft.consentConfirmed}
                onChange={(e) =>
                  setTestimonialDraft({
                    ...testimonialDraft,
                    consentConfirmed: e.target.checked,
                  })
                }
              />
              I confirm the owner gave explicit consent for this screenshot or
              video to be published (recorded on {new Date().toLocaleDateString("en-CA")})
            </label>
            <label>
              How was the owner&rsquo;s consent recorded?
              <input
                maxLength={120}
                placeholder="e.g. WhatsApp approval from the owner"
                value={testimonialDraft.consentSource}
                onChange={(e) =>
                  setTestimonialDraft({
                    ...testimonialDraft,
                    consentSource: e.target.value,
                  })
                }
              />
            </label>
            <PublishedToggle
              checked={testimonialDraft.isPublished}
              disabled={
                !testimonialDraft.mediaUrl.trim() ||
                !testimonialDraft.consentConfirmed ||
                !testimonialDraft.consentSource.trim()
              }
              onChange={(value) =>
                setTestimonialDraft({ ...testimonialDraft, isPublished: value })
              }
              label="Show on the public testimonials page"
            />
            {testimonialDraft.isPublished &&
              (!testimonialDraft.mediaUrl.trim() ||
                !testimonialDraft.consentConfirmed ||
                !testimonialDraft.consentSource.trim()) && (
                <p className="muted small">
                  Publishing requires attached media plus the owner&rsquo;s
                  recorded consent and consent source. The server rejects any
                  other combination.
                </p>
              )}
            <div className="row-actions">
              <button className="button primary" type="submit">
                Save testimonial
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() => setTestimonialDraft(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {testimonials.map((t) => (
          <div key={t.id} style={rowStyle}>
            <div>
              <strong>{t.ownerName}</strong>{" "}
              <span className="muted small">
                {t.city && `${t.city} · `}
                {t.mediaType === "VIDEO" ? "video" : "image"} ·{" "}
                {t.consentConfirmed
                  ? `consent recorded${t.consentRecordedAt ? ` ${t.consentRecordedAt.slice(0, 10)}` : ""}`
                  : "no consent recorded"}
              </span>
              {!t.isPublished && <span className="badge draft">Draft</span>}
            </div>
            <div className="row-actions">
              <PublishedToggle
                checked={t.isPublished}
                disabled={!t.mediaUrl.trim() || !t.consentConfirmed || !t.consentSource.trim()}
                onChange={(value) =>
                  void run(async () => {
                    await api(`/admin/portfolio/testimonials/${t.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ isPublished: value }),
                    });
                    await load();
                  }, "Visibility updated.")
                }
                label="Published"
              />
              <button
                className="button secondary"
                onClick={() =>
                  setTestimonialDraft({
                    ownerName: t.ownerName,
                    city: t.city,
                    quote: t.quote,
                    mediaType: t.mediaType,
                    mediaUrl: t.mediaUrl,
                    consentConfirmed: t.consentConfirmed,
                    consentSource: t.consentSource,
                    sortOrder: t.sortOrder,
                    isPublished: t.isPublished,
                    id: t.id,
                  })
                }
              >
                Edit
              </button>
              {t.mediaUrl && (
                <button
                  className="button secondary"
                  onClick={() =>
                    ask(
                      "Redact media?",
                      `The attached ${t.mediaType === "VIDEO" ? "video" : "screenshot"} for ${t.ownerName} will be removed and the testimonial returned to draft. Use this when a screenshot exposes private details; you can upload a redacted replacement afterwards.`,
                      async () => {
                        await api(`/admin/portfolio/testimonials/${t.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            mediaUrl: "",
                            isPublished: false,
                          }),
                        });
                        await load();
                      },
                    )
                  }
                >
                  Redact media
                </button>
              )}
              <button
                className="button danger"
                onClick={() =>
                  ask(
                    "Remove testimonial?",
                    `${t.ownerName}'s testimonial will be removed.`,
                    async () => {
                      await api(`/admin/portfolio/testimonials/${t.id}`, {
                        method: "DELETE",
                      });
                      await load();
                    },
                  )
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!testimonials.length && !loadError && (
          <p className="muted small">No testimonials yet.</p>
        )}
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CASE STUDIES</p>
            <h2>Case studies</h2>
          </div>
          <button
            className="button primary"
            onClick={() => setCaseDraft(caseDraft ? null : { ...emptyCase })}
          >
            <Icon name="plus" /> {caseDraft?.id ? "Edit case study" : "Add case study"}
          </button>
        </div>
        {caseDraft && (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              const { id, ...raw } = caseDraft;
              const body = { ...raw, propertyId: raw.propertyId || null };
              void run(async () => {
                await api(
                  id ? `/admin/portfolio/cases/${id}` : "/admin/portfolio/cases",
                  { method: id ? "PATCH" : "POST", body: JSON.stringify(body) },
                );
                setCaseDraft(null);
                await load();
              }, "Case study saved.");
            }}
          >
            <div className="form-grid">
              <label>
                Title
                <input
                  required
                  maxLength={160}
                  value={caseDraft.title}
                  onChange={(e) =>
                    setCaseDraft({ ...caseDraft, title: e.target.value })
                  }
                />
              </label>
              <label>
                City
                <input
                  maxLength={80}
                  value={caseDraft.city}
                  onChange={(e) =>
                    setCaseDraft({ ...caseDraft, city: e.target.value })
                  }
                />
              </label>
              <label>
                Linked property
                <select
                  value={caseDraft.propertyId}
                  onChange={(e) =>
                    setCaseDraft({ ...caseDraft, propertyId: e.target.value })
                  }
                >
                  <option value="">None</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  min={0}
                  max={99999}
                  value={caseDraft.sortOrder}
                  onChange={(e) =>
                    setCaseDraft({
                      ...caseDraft,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <label>
              Summary
              <textarea
                rows={2}
                maxLength={600}
                value={caseDraft.summary}
                onChange={(e) =>
                  setCaseDraft({ ...caseDraft, summary: e.target.value })
                }
              />
            </label>
            <label>
              Outcome
              <textarea
                rows={2}
                maxLength={600}
                value={caseDraft.outcome}
                onChange={(e) =>
                  setCaseDraft({ ...caseDraft, outcome: e.target.value })
                }
              />
            </label>
            <label>
              Cover image URL
              <input
                type="url"
                maxLength={2000}
                placeholder="https://…"
                value={caseDraft.coverUrl}
                onChange={(e) =>
                  setCaseDraft({ ...caseDraft, coverUrl: e.target.value })
                }
              />
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                void onPick("cases", "image", e.target.files?.[0], (url) =>
                  setCaseDraft((d) => (d ? { ...d, coverUrl: url } : d)),
                )
              }
            />
            <PublishedToggle
              checked={caseDraft.isPublished}
              disabled={false}
              onChange={(value) =>
                setCaseDraft({ ...caseDraft, isPublished: value })
              }
              label="Show on the public portfolio"
            />
            <div className="row-actions">
              <button className="button primary" type="submit">
                Save case study
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() => setCaseDraft(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {cases.map((c) => (
          <div key={c.id} style={rowStyle}>
            <div>
              <strong>{c.title}</strong>{" "}
              <span className="muted small">
                {c.city || "—"}
                {c.property ? ` · ${c.property.name}` : ""}
              </span>
              {!c.isPublished && <span className="badge draft">Draft</span>}
            </div>
            <div className="row-actions">
              <PublishedToggle
                checked={c.isPublished}
                disabled={false}
                onChange={(value) =>
                  void run(async () => {
                    await api(`/admin/portfolio/cases/${c.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ isPublished: value }),
                    });
                    await load();
                  }, "Visibility updated.")
                }
                label="Published"
              />
              <button
                className="button secondary"
                onClick={() =>
                  setCaseDraft({
                    propertyId: c.propertyId ?? "",
                    title: c.title,
                    city: c.city,
                    summary: c.summary,
                    outcome: c.outcome,
                    coverUrl: c.coverUrl,
                    sortOrder: c.sortOrder,
                    isPublished: c.isPublished,
                    id: c.id,
                  })
                }
              >
                Edit
              </button>
              <button
                className="button danger"
                onClick={() =>
                  ask(
                    "Remove case study?",
                    `"${c.title}" will be removed from the portfolio.`,
                    async () => {
                      await api(`/admin/portfolio/cases/${c.id}`, {
                        method: "DELETE",
                      });
                      await load();
                    },
                  )
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!cases.length && !loadError && (
          <p className="muted small">No case studies yet.</p>
        )}
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">VISIBILITY</p>
            <h2>Guest &amp; portfolio availability</h2>
          </div>
        </div>
        <p className="muted small">
          Guest listings appear in search and stay pages. Portfolio visibility
          controls whether a property appears in city-wise owner portfolio
          pages.
        </p>
        {properties.map((p) => (
          <div key={p.id} style={rowStyle}>
            <div>
              <strong>{p.name}</strong>{" "}
              <span className="muted small">{p.status}</span>
            </div>
            <div className="row-actions">
              <PublishedToggle
                checked={p.guestEnabled !== false}
                disabled={false}
                onChange={(value) =>
                  void run(async () => {
                    await api(`/admin/portfolio/properties/${p.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ guestEnabled: value }),
                    });
                    await load();
                  }, "Guest visibility updated.")
                }
                label="Guest listing"
              />
              <PublishedToggle
                checked={p.portfolioEnabled !== false}
                disabled={false}
                onChange={(value) =>
                  void run(async () => {
                    await api(`/admin/portfolio/properties/${p.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ portfolioEnabled: value }),
                    });
                    await load();
                  }, "Portfolio visibility updated.")
                }
                label="Owner portfolio"
              />
            </div>
          </div>
        ))}
        {!properties.length && !loadError && (
          <p className="muted small">No properties yet.</p>
        )}
      </section>
    </>
  );
}