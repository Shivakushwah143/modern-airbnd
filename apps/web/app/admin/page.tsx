"use client";
import { useEffect, useState, type FormEvent } from "react";
import type {
  Property,
  Location,
  Amenity,
  Settings,
  Unit,
} from "@modern-airbnd/contracts";
import { api, ApiError, emptySettings } from "@/lib/api";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { Photo } from "@/components/Photo";
import { PropertyBody } from "@/components/PropertyBody";
type Tab =
  | "dashboard"
  | "properties"
  | "enquiries"
  | "reservations"
  | "guests"
  | "owners"
  | "ownerLeads"
  | "housekeeping"
  | "maintenance"
  | "locations"
  | "settings";
type Confirm = { title: string; message: string; action: () => Promise<void> };
type AdminPropertyLabel = { id?: string; name: string; slug?: string; status?: string };
type AdminEnquiry = {
  id: string;
  propertyId: string;
  property?: AdminPropertyLabel;
  status: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  phone: string;
  message: string;
};
type AdminReservation = {
  id: string;
  property?: AdminPropertyLabel;
  source: string;
  status: string;
  stayStatus: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  phone?: string;
  operationalNotes?: string;
};
type AdminGuest = { id: string; name: string; phone: string };
type AdminOwnerLead = {
  id: string;
  status: string;
  name: string;
  phone: string;
  email: string;
  city: string;
};
type Phase1 = {
  enquiries: AdminEnquiry[];
  reservations: AdminReservation[];
  guests: AdminGuest[];
  ownerLeads: AdminOwnerLead[];
};
type Dashboard = {
  date: string;
  counts: Record<string, number>;
  arrivals: AdminReservation[];
  departures: AdminReservation[];
  upcoming: AdminReservation[];
};
type AdminOwner = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  properties: AdminPropertyLabel[];
};
type HousekeepingTask = {
  id: string;
  propertyId: string;
  reservationId: string | null;
  property?: AdminPropertyLabel;
  reservation?: { id: string; guestName: string; checkOut: string };
  assigneeName: string;
  dueDate: string;
  status: string;
  notes: string;
};
type MaintenanceIssue = {
  id: string;
  propertyId: string;
  property?: AdminPropertyLabel;
  title: string;
  description: string;
  priority: string;
  assigneeName: string;
  status: string;
  cost: string | number | null;
  notes: string;
};
const defaultProperty = {
  name: "",
  slug: "",
  locationId: "",
  shortDescription: "",
  description: "",
  propertyType: "Entire apartment",
  area: "",
  addressLine: "",
  latitude: null as number | null,
  longitude: null as number | null,
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  maxGuests: 2,
  whatsappNumber: "",
  houseRules: [] as string[],
  checkInInfo: "",
  checkOutInfo: "",
  propertyNotes: "",
  seoTitle: "",
  seoDescription: "",
  amenityIds: [] as string[],
  localHighlights: [] as { name: string; detail: string }[],
  suitedFor: [] as string[],
};
type Draft = typeof defaultProperty;
function draftOf(p: Property): Draft {
  const v = { ...defaultProperty };
  for (const key of Object.keys(defaultProperty) as (keyof Draft)[]) {
    if (key === "amenityIds") continue;
    Object.assign(v, { [key]: p[key as keyof Property] });
  }
  return { ...v, amenityIds: p.amenities.map((a) => a.id) };
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export default function Admin() {
  const [auth, setAuth] = useState<boolean | null>(null),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard"),
    [properties, setProperties] = useState<Property[]>([]),
    [locations, setLocations] = useState<Location[]>([]),
    [amenities, setAmenities] = useState<Amenity[]>([]),
    [settings, setSettings] = useState<Settings>(emptySettings),
    [phase1, setPhase1] = useState<Phase1>({
      enquiries: [],
      reservations: [],
      guests: [],
      ownerLeads: [],
    }),
    [dashboard, setDashboard] = useState<Dashboard | null>(null),
    [owners, setOwners] = useState<AdminOwner[]>([]),
    [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>([]),
    [maintenance, setMaintenance] = useState<MaintenanceIssue[]>([]);
  const [editing, setEditing] = useState<string | null>(null),
    [draft, setDraft] = useState<Draft>(defaultProperty),
    [confirm, setConfirm] = useState<Confirm | null>(null);
  const [unitId, setUnitId] = useState(""),
    [unitName, setUnitName] = useState(""),
    [block, setBlock] = useState({
      startDate: "",
      endDate: "",
      reason: "OWNER_BLOCKED",
      note: "",
    }),
    [mediaAlt, setMediaAlt] = useState("");
  const [locationDraft, setLocationDraft] = useState({
      name: "",
      slug: "",
      state: "",
      isActive: true,
    }),
    [amenityName, setAmenityName] = useState("");
  const [proof, setProof] = useState({
    provider: "",
    url: "",
    rating: "",
    reviewCount: "",
    verifiedAt: "",
    isVisible: false,
  });
  const [reservationDraft, setReservationDraft] = useState({
    propertyId: "",
    source: "WHATSAPP",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    guestName: "",
    phone: "",
    notes: "",
  });
  const [ownerDraft, setOwnerDraft] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [housekeepingDraft, setHousekeepingDraft] = useState({
    propertyId: "",
    reservationId: "",
    assigneeName: "",
    dueDate: "",
    status: "PENDING",
    notes: "",
  });
  const [maintenanceDraft, setMaintenanceDraft] = useState({
    propertyId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeName: "",
    status: "OPEN",
    cost: "",
    notes: "",
  });
  const [step, setStep] = useState(1),
    [preview, setPreview] = useState<Property | null>(null),
    [readiness, setReadiness] = useState<{
      ready: boolean;
      errors: string[];
    } | null>(null),
    [reviewConfirmed, setReviewConfirmed] = useState(false);
  const current = properties.find((p) => p.id === editing);
  const unit =
    current?.units.find((u) => u.id === unitId) ||
    current?.units.find(
      (u) =>
        u.isActive &&
        (current.inventoryMode === "ENTIRE_PROPERTY"
          ? u.isEntireProperty
          : !u.isEntireProperty),
    );
  const [msgDetails, setMsgDetails] = useState<string[]>([]);
  async function refresh() {
    const [p, l, a, s, ph, d, o, h, m] = await Promise.all([
      api<Property[]>("/admin/properties"),
      api<Location[]>("/admin/locations"),
      api<Amenity[]>("/admin/amenities"),
      api<Settings>("/admin/settings"),
      api<Phase1>("/admin/phase1"),
      api<Dashboard>("/admin/dashboard"),
      api<AdminOwner[]>("/admin/owners"),
      api<HousekeepingTask[]>("/admin/housekeeping"),
      api<MaintenanceIssue[]>("/admin/maintenance"),
    ]);
    setProperties(p);
    setLocations(l);
    setAmenities(a);
    setSettings(s);
    setPhase1(ph);
    setDashboard(d);
    setOwners(o);
    setHousekeeping(h);
    setMaintenance(m);
  }
  useEffect(() => {
    api("/admin/auth/session")
      .then(() => {
        setAuth(true);
        return refresh();
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) setAuth(false);
        else {
          setAuth(false);
          setError("The owner workspace could not be reached. Please retry.");
        }
      });
  }, []);
  async function run(fn: () => Promise<void>, success = "Saved successfully.") {
    setBusy(true);
    setError("");
    setMsgDetails([]);
    setNotice("");
    try {
      await fn();
      setNotice(success);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setAuth(false);
      setError(e instanceof Error ? e.message : "Unable to save.");
      if (e instanceof ApiError && Array.isArray(e.details))
        setMsgDetails(e.details);
    } finally {
      setBusy(false);
    }
  }
  function open(p?: Property, nextStep = 1) {
    setStep(nextStep);
    setReadiness(null);
    setReviewConfirmed(false);
    setEditing(p?.id || "new");
    setDraft(
      p
        ? draftOf(p)
        : {
            ...defaultProperty,
            locationId: locations.find((l) => l.isActive)?.id || "",
          },
    );
    setUnitId(p?.units[0]?.id || "");
    setError("");
    setNotice("");
  }
  function field<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    await run(async () => {
      const p = await api<Property>(
        editing === "new"
          ? "/admin/properties"
          : `/admin/properties/${editing}`,
        {
          method: editing === "new" ? "POST" : "PATCH",
          body: JSON.stringify({
            ...draft,
            houseRules: draft.houseRules.filter((v) => v.trim()),
            suitedFor: draft.suitedFor.filter((v) => v.trim()),
          }),
        },
      );
      await refresh();
      setEditing(p.id);
      setUnitId(p.units[0]?.id || "");
    }, "Property saved.");
  }
  async function upload(file: File) {
    await run(async () => {
      if (!current) throw new Error("Save your property first.");
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error("Choose a JPEG, PNG or WebP image under 10 MB.");
      if (mediaAlt.trim().length < 3)
        throw new Error("Add a description of this photo first.");
      const s = await api<{
        timestamp: number;
        public_id: string;
        overwrite: boolean;
        allowed_formats: string;
        type: string;
        signature: string;
        apiKey: string;
        cloudName: string;
      }>("/admin/media/signature", {
        method: "POST",
        body: JSON.stringify({ propertyId: current.id }),
      });
      const form = new FormData();
      form.set("file", file);
      for (const k of [
        "timestamp",
        "public_id",
        "overwrite",
        "allowed_formats",
        "type",
        "signature",
      ] as const)
        form.set(k, String(s[k]));
      form.set("api_key", s.apiKey);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`,
        { method: "POST", body: form, signal: AbortSignal.timeout(120000) },
      );
      const result = await response.json();
      if (!response.ok) throw new Error("Image upload failed. Please retry.");
      await api(`/admin/properties/${current.id}/media`, {
        method: "POST",
        body: JSON.stringify({ publicId: result.public_id, altText: mediaAlt }),
      });
      await refresh();
      setMediaAlt("");
    }, "Photo uploaded.");
  }
  function ask(title: string, message: string, action: () => Promise<void>) {
    setConfirm({ title, message, action });
  }
  async function status(action: string) {
    if (!current) return;
    await api(`/admin/properties/${current.id}/${action}`, { method: "POST" });
    await refresh();
  }
  if (auth === null)
    return (
      <div className="container section">
        <p>Opening owner workspace…</p>
      </div>
    );
  if (!auth)
    return (
      <div className="login-card">
        <span className="brand-mark">
          <Icon name="shield" size={30} />
        </span>
        <p className="eyebrow">MODERN AIRBND</p>
        <h1>Owner access</h1>
        <p className="muted">Manage your properties and availability.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await api("/admin/auth/login", {
                method: "POST",
                body: JSON.stringify({ password }),
              });
              setPassword("");
              await refresh();
              setAuth(true);
            }, "Signed in.");
          }}
        >
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              maxLength={512}
            />
          </label>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  return (
    <div className="admin-layout container">
      <aside className="admin-nav">
        <p className="eyebrow">OWNER WORKSPACE</p>
        <h2>Your portfolio</h2>
        {(
          [
            "dashboard",
            "properties",
            "enquiries",
            "reservations",
            "guests",
            "owners",
            "ownerLeads",
            "housekeeping",
            "maintenance",
            "locations",
            "settings",
          ] as Tab[]
        ).map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => {
              setTab(t);
              setEditing(null);
              setError("");
            }}
          >
            {t === "ownerLeads"
              ? "Owner Leads"
              : t === "settings"
              ? "Business & contact"
              : t === "dashboard"
              ? "Dashboard"
              : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button
          onClick={() =>
            void run(async () => {
              await api("/admin/auth/logout", { method: "POST" });
              setAuth(false);
              setEditing(null);
            }, "Signed out.")
          }
        >
          Sign out
        </button>
      </aside>
      <div className="admin-main">
        <div aria-live="polite">
          {notice && <p className="notice success">{notice}</p>}
        </div>
        {error && (
          <div role="alert" className="notice error">
            <p>{error}</p>
            {msgDetails.length > 0 && (
              <ul>
                {msgDetails.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === "properties" && !editing && (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE BIG PICTURE</p>
                <h1>Properties</h1>
              </div>
              <button className="button primary" onClick={() => open()}>
                <Icon name="plus" />
                Add Property
              </button>
            </div>
            <div className="stat-grid">
              {[
                ["Total", properties.length],
                [
                  "Published",
                  properties.filter((p) => p.status === "PUBLISHED").length,
                ],
                [
                  "Draft",
                  properties.filter((p) => p.status === "DRAFT").length,
                ],
              ].map(([label, count]) => (
                <div className="stat" key={label}>
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
            <div className="admin-property-list">
              {properties.map((p) => (
                <article key={p.id}>
                  <div className="admin-thumb">
                    <Photo media={p.media[0]} demo={p.isDemo} />
                  </div>
                  <div>
                    <span className="eyebrow">{p.location.name}</span>
                    <h3>{p.name}</h3>
                    <span className={`status ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                    <p className="small muted">
                      {p.inventoryMode === "ENTIRE_PROPERTY"
                        ? "Entire property"
                        : `${p.units.filter((u) => u.isActive && !u.isEntireProperty).length} active rooms`}{" "}
                      · {p.units.flatMap((u) => u.blocks).length} date blocks
                    </p>
                    <small>
                      Updated{" "}
                      {new Date(p.updatedAt).toLocaleDateString("en-IN")}
                    </small>
                    {p.inventoryReviewRequired && (
                      <p className="field-error">
                        Review inventory before publishing
                      </p>
                    )}
                  </div>
                  <div className="row-actions">
                    <button
                      className="button secondary"
                      onClick={() => open(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => open(p, 9)}
                    >
                      Availability
                    </button>
                    <button
                      className="button secondary"
                      onClick={() =>
                        void run(
                          async () =>
                            setPreview(
                              await api<Property>(
                                `/admin/properties/${p.id}/preview`,
                              ),
                            ),
                          "Private preview opened.",
                        )
                      }
                    >
                      Preview
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!properties.length && (
              <div className="empty-state">
                <h2>Your first property starts here.</h2>
                <p>
                  Create a draft, add photos and contact details, then publish
                  when it’s ready.
                </p>
              </div>
            )}
          </>
        )}
        {tab === "properties" && editing && (
          <>
            <button
              className="text-link back-link"
              onClick={() => {
                setEditing(null);
                setError("");
              }}
            >
              Back to properties
            </button>
            <div className="section-heading">
              <h1>{editing === "new" ? "Add a property" : current?.name}</h1>
              {current && <span className="status">{current.status}</span>}
            </div>
            {current?.isDemo && (
              <p className="notice">
                This is a demonstration record. Create a new property for real
                inventory. You can test availability or archive this record.
              </p>
            )}
            <nav className="wizard-nav" aria-label="Property setup">
              {[
                "Basics",
                "Photos",
                "How guests stay",
                "Rooms & capacity",
                "Amenities",
                "Stay Truths",
                "Contact",
                "Preview & publish",
                "Availability",
              ].map((name, i) => (
                <button
                  key={name}
                  type="button"
                  aria-current={step === i + 1 ? "step" : undefined}
                  disabled={editing === "new" && i > 0}
                  onClick={() => {
                    setStep(i + 1);
                    setError("");
                  }}
                >
                  <span>{i + 1}</span>
                  {name}
                </button>
              ))}
            </nav>
            {editing === "new" && (
              <p className="notice">
                Start with a name and location. Save your draft to add photos
                and prepare the stay.
              </p>
            )}
            <form onSubmit={save}>
              <fieldset disabled={busy || current?.isDemo}>
                <section hidden={step !== 1} className="admin-section">
                  <h2>Start with the space</h2>
                  <div className="form-grid">
                    <label>
                      Property name
                      <input
                        required
                        value={draft.name}
                        maxLength={200}
                        onChange={(e) => {
                          field("name", e.target.value);
                          if (editing === "new")
                            field("slug", slugify(e.target.value));
                        }}
                      />
                    </label>
                    <label>
                      Location
                      <select
                        required
                        value={draft.locationId}
                        onChange={(e) => field("locationId", e.target.value)}
                      >
                        <option value="">Select location</option>
                        {locations.map((l) => (
                          <option value={l.id} key={l.id}>
                            {l.name}
                            {l.isActive ? "" : " (inactive)"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Property type
                      <input
                        value={draft.propertyType}
                        onChange={(e) => field("propertyType", e.target.value)}
                        maxLength={100}
                      />
                    </label>
                    <label className="span-2">
                      Short description
                      <input
                        value={draft.shortDescription}
                        maxLength={300}
                        onChange={(e) =>
                          field("shortDescription", e.target.value)
                        }
                      />
                    </label>
                    <label className="span-2">
                      Description
                      <textarea
                        value={draft.description}
                        onChange={(e) => field("description", e.target.value)}
                        maxLength={10000}
                        rows={5}
                      />
                      <small>At least 30 characters before publishing.</small>
                    </label>
                  </div>
                  <details>
                    <summary>Advanced Settings</summary>
                    <div className="form-grid">
                      <label>
                        URL slug
                        <input
                          required
                          pattern="[a-z0-9]+(-[a-z0-9]+)*"
                          value={draft.slug}
                          maxLength={120}
                          onChange={(e) => field("slug", e.target.value)}
                        />
                        <small>Changing this changes the public link.</small>
                      </label>
                      {(["latitude", "longitude"] as const).map((k) => (
                        <label key={k}>
                          {k}
                          <input
                            type="number"
                            step="any"
                            min={k === "latitude" ? -90 : -180}
                            max={k === "latitude" ? 90 : 180}
                            value={draft[k] ?? ""}
                            onChange={(e) =>
                              field(
                                k,
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                          />
                        </label>
                      ))}
                      <label>
                        SEO title
                        <input
                          value={draft.seoTitle}
                          maxLength={100}
                          onChange={(e) => field("seoTitle", e.target.value)}
                        />
                      </label>
                      <label>
                        SEO description
                        <input
                          value={draft.seoDescription}
                          maxLength={200}
                          onChange={(e) =>
                            field("seoDescription", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  </details>
                </section>
                <section hidden={step !== 4} className="admin-section">
                  <h2>Rooms & capacity</h2>
                  <div className="form-grid">
                    <label>
                      Area / neighbourhood
                      <input
                        value={draft.area}
                        maxLength={200}
                        onChange={(e) => field("area", e.target.value)}
                      />
                    </label>
                    <label>
                      Public address
                      <input
                        value={draft.addressLine}
                        maxLength={500}
                        onChange={(e) => field("addressLine", e.target.value)}
                      />
                      <small>
                        Only enter address information you want displayed
                        publicly.
                      </small>
                    </label>
                    {(
                      ["bedrooms", "bathrooms", "beds", "maxGuests"] as const
                    ).map((k) => (
                      <label key={k}>
                        {k === "maxGuests"
                          ? "Maximum guests"
                          : k[0].toUpperCase() + k.slice(1)}
                        <input
                          type="number"
                          min={k === "maxGuests" ? 1 : 0}
                          max={k === "maxGuests" ? 200 : 100}
                          value={draft[k]}
                          onChange={(e) => field(k, Number(e.target.value))}
                        />
                      </label>
                    ))}
                  </div>
                </section>
                <section hidden={step !== 5} className="admin-section">
                  <h2>Amenities</h2>
                  <div className="check-grid">
                    {amenities.map((a) => (
                      <label className="checkbox" key={a.id}>
                        <input
                          type="checkbox"
                          checked={draft.amenityIds.includes(a.id)}
                          onChange={(e) =>
                            field(
                              "amenityIds",
                              e.target.checked
                                ? [...draft.amenityIds, a.id]
                                : draft.amenityIds.filter((id) => id !== a.id),
                            )
                          }
                        />
                        {a.name}
                      </label>
                    ))}
                  </div>
                </section>
                <section hidden={step !== 6} className="admin-section">
                  <h2>Stay Truths</h2>
                  <div className="form-grid">
                    <label className="span-2">
                      House rules (one per line)
                      <textarea
                        value={draft.houseRules.join("\n")}
                        onChange={(e) =>
                          field("houseRules", e.target.value.split("\n"))
                        }
                        rows={4}
                      />
                    </label>
                    <label>
                      Check-in information
                      <input
                        value={draft.checkInInfo}
                        onChange={(e) => field("checkInInfo", e.target.value)}
                      />
                    </label>
                    <label>
                      Check-out information
                      <input
                        value={draft.checkOutInfo}
                        onChange={(e) => field("checkOutInfo", e.target.value)}
                      />
                    </label>
                    <label className="span-2">
                      Important property notes
                      <textarea
                        value={draft.propertyNotes}
                        onChange={(e) => field("propertyNotes", e.target.value)}
                        rows={3}
                      />
                    </label>
                  </div>
                  <h3>Local Lens</h3>
                  <p className="muted">
                    Add only places and travel details you have checked. Leave
                    blank if unknown.
                  </p>
                  {draft.localHighlights.map((h, i) => (
                    <div className="form-grid" key={i}>
                      <label>
                        Nearby place
                        <input
                          value={h.name}
                          onChange={(e) =>
                            field(
                              "localHighlights",
                              draft.localHighlights.map((x, j) =>
                                j === i ? { ...x, name: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Local detail
                        <input
                          value={h.detail}
                          onChange={(e) =>
                            field(
                              "localHighlights",
                              draft.localHighlights.map((x, j) =>
                                j === i ? { ...x, detail: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() =>
                          field(
                            "localHighlights",
                            draft.localHighlights.filter((_, j) => j !== i),
                          )
                        }
                      >
                        Remove local detail
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button secondary"
                    disabled={draft.localHighlights.length >= 12}
                    onClick={() =>
                      field("localHighlights", [
                        ...draft.localHighlights,
                        { name: "", detail: "" },
                      ])
                    }
                  >
                    Add nearby place
                  </button>
                  <label>
                    Best suited for (one per line)
                    <textarea
                      value={draft.suitedFor.join("\n")}
                      onChange={(e) =>
                        field("suitedFor", e.target.value.split("\n"))
                      }
                    />
                  </label>
                </section>
                <section hidden={step !== 7} className="admin-section">
                  <h2>How guests contact you</h2>
                  <label className="span-2">
                    Property WhatsApp number
                    <input
                      type="tel"
                      placeholder="International format, starting with +"
                      value={draft.whatsappNumber}
                      onChange={(e) => field("whatsappNumber", e.target.value)}
                    />
                    <small>
                      Leave blank to use the global business WhatsApp number.
                    </small>
                  </label>
                  <p className="muted">
                    The property contact takes priority. Otherwise the business
                    WhatsApp number is used.
                  </p>
                </section>
                <button className="button primary" disabled={busy}>
                  {busy
                    ? "Saving…"
                    : current?.status === "PUBLISHED"
                      ? "Save changes"
                      : "Save Draft"}
                </button>
              </fieldset>
            </form>
            {current && (
              <>
                <section hidden={step !== 2} className="admin-section">
                  <h2>Photos that tell the story</h2>
                  <p className="muted">
                    Use real photographs of this property. JPEG, PNG or WebP, up
                    to 10 MB each.
                  </p>
                  <label>
                    Photo description
                    <input
                      value={mediaAlt}
                      onChange={(e) => setMediaAlt(e.target.value)}
                      maxLength={300}
                      placeholder="Describe the room or view"
                    />
                  </label>
                  <label className="upload-label">
                    Upload a photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy || current.isDemo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void upload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <div className="media-grid">
                    {[...current.media]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((m, i, ordered) => (
                        <div key={m.id} className="media-item">
                          <Photo media={m} />
                          <p>
                            {m.altText}
                            {m.isCover ? " · Cover" : ""}
                          </p>
                          <div className="row-actions">
                            <button
                              disabled={busy || m.isCover}
                              onClick={() =>
                                void run(async () => {
                                  await api(
                                    `/admin/properties/${current.id}/media/${m.id}`,
                                    {
                                      method: "PATCH",
                                      body: JSON.stringify({ isCover: true }),
                                    },
                                  );
                                  await refresh();
                                }, "Cover updated.")
                              }
                            >
                              Set cover
                            </button>
                            <button
                              disabled={busy || i === 0}
                              onClick={() =>
                                void run(async () => {
                                  const ids = ordered.map((x) => x.id);
                                  [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
                                  await api(
                                    `/admin/properties/${current.id}/media/order`,
                                    {
                                      method: "PATCH",
                                      body: JSON.stringify({ ids }),
                                    },
                                  );
                                  await refresh();
                                }, "Photo order updated.")
                              }
                            >
                              Move earlier
                            </button>
                            <button
                              disabled={busy}
                              onClick={() =>
                                ask(
                                  "Remove this photo?",
                                  "This will remove the photo from the property and Cloudinary.",
                                  async () => {
                                    await api(
                                      `/admin/properties/${current.id}/media/${m.id}`,
                                      { method: "DELETE" },
                                    );
                                    await refresh();
                                  },
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
                <section
                  hidden={step !== 3 && step !== 9}
                  className="admin-section"
                >
                  <h2>
                    {step === 3
                      ? "How is this property offered?"
                      : "Manage unavailable nights"}
                  </h2>
                  <p className="muted">
                    Choose the nights guests cannot stay. A property that
                    reopens on the 15th permits check-in on the 15th.
                  </p>
                  <div hidden={step !== 3}>
                    <p className="muted">
                      Choose whether guests stay in the entire space or book
                      individual rooms. Unpublish first to change this safely.
                    </p>
                    {current.inventoryReviewRequired && (
                      <div className="notice">
                        <p>
                          This existing property needs an inventory review. Your
                          rooms and past blocks are preserved. Whole-property
                          blocks will also protect rooms after switching.
                        </p>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={reviewConfirmed}
                            onChange={(e) =>
                              setReviewConfirmed(e.target.checked)
                            }
                          />
                          I have reviewed this property's rooms and date blocks.
                        </label>
                      </div>
                    )}
                    <div className="inventory-choice">
                      {(["ENTIRE_PROPERTY", "MULTI_UNIT"] as const).map(
                        (mode) => (
                          <button
                            key={mode}
                            className={
                              current.inventoryMode === mode
                                ? "button primary"
                                : "button secondary"
                            }
                            disabled={
                              busy ||
                              current.status === "PUBLISHED" ||
                              (current.inventoryReviewRequired &&
                                !reviewConfirmed)
                            }
                            onClick={() =>
                              void run(async () => {
                                await api(
                                  `/admin/properties/${current.id}/inventory`,
                                  {
                                    method: "PATCH",
                                    body: JSON.stringify({
                                      mode,
                                      confirmReview: reviewConfirmed,
                                    }),
                                  },
                                );
                                await refresh();
                                setUnitId("");
                              }, "How guests stay has been updated. Existing blocked nights are preserved.")
                            }
                          >
                            {mode === "ENTIRE_PROPERTY"
                              ? "Entire property"
                              : "Individual rooms"}
                          </button>
                        ),
                      )}
                    </div>
                    <p className="small muted">
                      Switching keeps existing blocked nights conservatively.
                      Review copied blocks before reopening dates.
                    </p>
                  </div>
                  <div className="unit-list">
                    {current.units
                      .filter((u) => u.isActive || !u.isEntireProperty)
                      .map((u) => (
                        <div key={u.id} className="unit-row">
                          <button
                            className={
                              unit?.id === u.id
                                ? "button primary"
                                : "button secondary"
                            }
                            onClick={() => setUnitId(u.id)}
                          >
                            {u.name}
                            {u.isActive ? "" : " · inactive"}
                          </button>
                          <button
                            hidden={current.inventoryMode === "ENTIRE_PROPERTY"}
                            className="text-link"
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await api(`/admin/units/${u.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    name: u.name,
                                    isActive: !u.isActive,
                                  }),
                                });
                                await refresh();
                              }, "Unit updated.")
                            }
                          >
                            {u.isActive ? "Remove room" : "Restore room"}
                          </button>
                          {!u.isEntireProperty && (
                            <RoomName
                              name={u.name}
                              disabled={busy}
                              save={(name) =>
                                run(async () => {
                                  await api(`/admin/units/${u.id}`, {
                                    method: "PATCH",
                                    body: JSON.stringify({
                                      name,
                                      isActive: u.isActive,
                                    }),
                                  });
                                  await refresh();
                                }, "Room name updated.")
                              }
                            />
                          )}
                        </div>
                      ))}
                  </div>
                  <form
                    hidden={
                      current.inventoryMode !== "MULTI_UNIT" || step !== 3
                    }
                    className="inline-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void run(async () => {
                        await api(`/admin/properties/${current.id}/units`, {
                          method: "POST",
                          body: JSON.stringify({
                            name: unitName,
                            isActive: true,
                          }),
                        });
                        setUnitName("");
                        await refresh();
                      }, "Unit added.");
                    }}
                  >
                    <label>
                      Room name
                      <input
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                        required
                        maxLength={100}
                      />
                    </label>
                    <button className="button secondary" disabled={busy}>
                      Add room
                    </button>
                  </form>
                  {unit && step === 9 && (
                    <>
                      <AvailabilityCalendar unit={unit} />
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void run(async () => {
                            const overlaps = unit.blocks.some(
                              (b) =>
                                block.startDate < b.endDate.slice(0, 10) &&
                                block.endDate > b.startDate.slice(0, 10),
                            );
                            await api(
                              `/admin/units/${unit.id}/availability-blocks`,
                              { method: "POST", body: JSON.stringify(block) },
                            );
                            await refresh();
                            setBlock({ ...block, note: "" });
                            if (overlaps)
                              setTimeout(
                                () =>
                                  setNotice(
                                    "Dates blocked. This range overlaps an existing block; both remain active.",
                                  ),
                                0,
                              );
                          }, "Dates blocked successfully.");
                        }}
                      >
                        <h3>Block dates · {unit.name}</h3>
                        <div className="form-grid">
                          <label>
                            Unavailable from
                            <input
                              type="date"
                              required
                              value={block.startDate}
                              onChange={(e) =>
                                setBlock({
                                  ...block,
                                  startDate: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Reopens on
                            <input
                              type="date"
                              required
                              value={block.endDate}
                              min={block.startDate}
                              onChange={(e) =>
                                setBlock({ ...block, endDate: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            Reason
                            <select
                              value={block.reason}
                              onChange={(e) =>
                                setBlock({ ...block, reason: e.target.value })
                              }
                            >
                              <option value="OWNER_BLOCKED">
                                Owner blocked
                              </option>
                              <option value="BOOKED">Booked</option>
                              <option value="MAINTENANCE">Maintenance</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </label>
                          <label>
                            Internal note
                            <input
                              value={block.note}
                              maxLength={1000}
                              onChange={(e) =>
                                setBlock({ ...block, note: e.target.value })
                              }
                            />
                          </label>
                        </div>
                        <p className="small muted">
                          {block.startDate &&
                          block.endDate &&
                          block.endDate > block.startDate
                            ? `Guests cannot stay for ${Math.round((Date.parse(block.endDate) - Date.parse(block.startDate)) / 86400000)} night(s), starting ${block.startDate}. Check-in reopens on ${block.endDate}.`
                            : "Choose the first unavailable night and the day guests can check in again."}
                        </p>
                        <button className="button primary" disabled={busy}>
                          Block Dates
                        </button>
                      </form>
                      <div className="blocks-list">
                        {unit.blocks.map((b) => (
                          <div key={b.id}>
                            <div>
                              <strong>
                                {b.startDate.slice(0, 10)} —{" "}
                                {b.endDate.slice(0, 10)}
                              </strong>
                              <p className="small muted">
                                {
                                  (
                                    {
                                      OWNER_BLOCKED: "Owner use",
                                      BOOKED: "Booked",
                                      MAINTENANCE: "Maintenance",
                                      OTHER: "Other",
                                    } as Record<string, string>
                                  )[b.reason]
                                }
                                {b.note ? ` · ${b.note}` : ""}
                              </p>
                            </div>
                            <button
                              className="button secondary"
                              disabled={busy}
                              onClick={() =>
                                ask(
                                  "Reopen this date range?",
                                  "Other overlapping blocks will still apply.",
                                  async () => {
                                    await api(
                                      `/admin/availability-blocks/${b.id}`,
                                      { method: "DELETE" },
                                    );
                                    await refresh();
                                  },
                                )
                              }
                            >
                              Remove block
                            </button>
                          </div>
                        ))}
                        {!unit.blocks.length && (
                          <p>No date blocks for this unit.</p>
                        )}
                      </div>
                    </>
                  )}
                </section>
                <section hidden={step !== 6} className="admin-section">
                  <details>
                    <summary>External listings & source evidence</summary>
                    <p className="muted">
                      Only display links and ratings you have checked against
                      the original source.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void run(async () => {
                          await api(`/admin/properties/${current.id}/proofs`, {
                            method: "POST",
                            body: JSON.stringify({
                              ...proof,
                              rating: proof.rating
                                ? Number(proof.rating)
                                : null,
                              reviewCount: proof.reviewCount
                                ? Number(proof.reviewCount)
                                : null,
                              verifiedAt: proof.verifiedAt || null,
                            }),
                          });
                          await refresh();
                        }, "Source saved.");
                      }}
                    >
                      <div className="form-grid">
                        <label>
                          Source name
                          <input
                            required
                            value={proof.provider}
                            onChange={(e) =>
                              setProof({ ...proof, provider: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Source URL
                          <input
                            type="url"
                            required
                            value={proof.url}
                            onChange={(e) =>
                              setProof({ ...proof, url: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Rating (optional, out of 5)
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={proof.rating}
                            onChange={(e) =>
                              setProof({ ...proof, rating: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Review count (optional)
                          <input
                            type="number"
                            min="0"
                            value={proof.reviewCount}
                            onChange={(e) =>
                              setProof({
                                ...proof,
                                reviewCount: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Source checked on
                          <input
                            type="date"
                            value={proof.verifiedAt}
                            onChange={(e) =>
                              setProof({ ...proof, verifiedAt: e.target.value })
                            }
                          />
                        </label>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={proof.isVisible}
                            onChange={(e) =>
                              setProof({
                                ...proof,
                                isVisible: e.target.checked,
                              })
                            }
                          />
                          Display publicly
                        </label>
                      </div>
                      <button className="button secondary" disabled={busy}>
                        Add source
                      </button>
                    </form>
                    {current.externalListings.map((p) => (
                      <div className="proof" key={p.id}>
                        <span>
                          {p.provider} · {p.isVisible ? "Visible" : "Hidden"}
                        </span>
                        <button
                          onClick={() =>
                            ask(
                              "Remove source?",
                              "The source will no longer appear on this property.",
                              async () => {
                                await api(
                                  `/admin/properties/${current.id}/proofs/${p.id}`,
                                  { method: "DELETE" },
                                );
                                await refresh();
                              },
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </details>
                </section>
                <section hidden={step !== 8} className="admin-section">
                  <h2>Preview & publish</h2>
                  <p>
                    Save your latest changes, then check what guests will see.
                  </p>
                  <div className="row-actions">
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          setPreview(
                            await api<Property>(
                              `/admin/properties/${current.id}/preview`,
                            ),
                          );
                        }, "Private preview opened.")
                      }
                    >
                      Preview as Guest
                    </button>
                    <button
                      className="button secondary"
                      onClick={() =>
                        void run(async () => {
                          setReadiness(
                            await api(
                              `/admin/properties/${current.id}/readiness`,
                            ),
                          );
                        }, "Readiness checked.")
                      }
                    >
                      Check readiness
                    </button>
                  </div>
                  <ul className="readiness-list">
                    {[
                      [
                        "Property details",
                        draft.description.trim().length >= 30,
                      ],
                      [
                        "Location",
                        !!locations.find(
                          (l) => l.id === draft.locationId && l.isActive,
                        ),
                      ],
                      ["Cover image", current.media.length > 0],
                      [
                        "Inventory",
                        !current.inventoryReviewRequired &&
                          current.units.some(
                            (u) =>
                              u.isActive &&
                              (current.inventoryMode === "ENTIRE_PROPERTY"
                                ? u.isEntireProperty
                                : !u.isEntireProperty),
                          ),
                      ],
                      [
                        "WhatsApp",
                        !!(
                          draft.whatsappNumber || settings.defaultWhatsappNumber
                        ),
                      ],
                      ["Amenities (recommended)", draft.amenityIds.length > 0],
                    ].map(([name, ready]) => (
                      <li key={String(name)}>
                        {ready ? "✓" : "○"} {name}
                      </li>
                    ))}
                  </ul>
                  {readiness && (
                    <div
                      className={readiness.ready ? "notice success" : "notice"}
                    >
                      {readiness.ready ? (
                        "All required publication checks passed."
                      ) : (
                        <>
                          <strong>Still needed</strong>
                          <ul>
                            {readiness.errors.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                  <div className="row-actions">
                    {current.status === "PUBLISHED" ? (
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => status("unpublish"),
                            "Property unpublished.",
                          )
                        }
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        className="button primary"
                        disabled={busy || current.isDemo}
                        onClick={() =>
                          void run(
                            () => status("publish"),
                            "Property published.",
                          )
                        }
                      >
                        Publish Property
                      </button>
                    )}
                    {current.status !== "ARCHIVED" && (
                      <button
                        className="button danger"
                        disabled={busy}
                        onClick={() =>
                          ask(
                            "Archive this property?",
                            "It will no longer appear publicly. Its records will be retained.",
                            () => status("archive"),
                          )
                        }
                      >
                        Archive
                      </button>
                    )}
                    {current.status === "PUBLISHED" && (
                      <a
                        className="button secondary"
                        href={`/properties/${current.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View public page
                      </a>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
        {tab === "dashboard" && dashboard && (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">TODAY</p>
                <h1>Operations dashboard</h1>
              </div>
            </div>
            <div className="stat-grid">
              {[
                ["Total", dashboard.counts.totalProperties, "properties"],
                ["Published", dashboard.counts.publishedProperties, "properties"],
                ["Check-ins", dashboard.counts.todaysCheckIns, "reservations"],
                ["Check-outs", dashboard.counts.todaysCheckOuts, "reservations"],
                ["Upcoming", dashboard.counts.upcomingStays, "reservations"],
                ["New enquiries", dashboard.counts.newGuestEnquiries, "enquiries"],
                ["Owner leads", dashboard.counts.newOwnerLeads, "ownerLeads"],
                ["Housekeeping", dashboard.counts.pendingHousekeeping, "housekeeping"],
                ["Maintenance", dashboard.counts.openMaintenance, "maintenance"],
              ].map(([label, count, target]) => (
                <button
                  className="stat"
                  key={label}
                  onClick={() => setTab(target as Tab)}
                >
                  <span>{label}</span>
                  <strong>{count}</strong>
                </button>
              ))}
            </div>
            <section className="admin-section">
              <h2>Today's check-ins</h2>
              <StayRows rows={dashboard.arrivals} run={run} refresh={refresh} />
            </section>
            <section className="admin-section">
              <h2>Today's check-outs</h2>
              <StayRows rows={dashboard.departures} run={run} refresh={refresh} />
            </section>
            <section className="admin-section">
              <h2>Upcoming stays</h2>
              <StayRows rows={dashboard.upcoming} run={run} refresh={refresh} />
            </section>
          </>
        )}
        {tab === "owners" && (
          <>
            <h1>Owners</h1>
            <section className="admin-section">
              <h2>{ownerDraft.id ? "Edit owner" : "Create owner"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const { id, ...body } = ownerDraft;
                    await api(id ? `/admin/owners/${id}` : "/admin/owners", {
                      method: id ? "PATCH" : "POST",
                      body: JSON.stringify(body),
                    });
                    setOwnerDraft({ id: "", name: "", phone: "", email: "", notes: "" });
                    await refresh();
                  }, "Owner saved.");
                }}
              >
                <div className="form-grid">
                  <label>Name<input required value={ownerDraft.name} onChange={(e) => setOwnerDraft({ ...ownerDraft, name: e.target.value })} /></label>
                  <label>Phone<input required value={ownerDraft.phone} onChange={(e) => setOwnerDraft({ ...ownerDraft, phone: e.target.value })} /></label>
                  <label>Email<input type="email" value={ownerDraft.email} onChange={(e) => setOwnerDraft({ ...ownerDraft, email: e.target.value })} /></label>
                </div>
                <label>Notes<textarea rows={3} value={ownerDraft.notes} onChange={(e) => setOwnerDraft({ ...ownerDraft, notes: e.target.value })} /></label>
                <button className="button primary" disabled={busy}>Save owner</button>
              </form>
            </section>
            <section className="admin-section">
              <h2>Owner records</h2>
              {owners.map((o) => (
                <div className="setting-row" key={o.id}>
                  <div>
                    <strong>{o.name}</strong>
                    <p>{o.phone} {o.email && `· ${o.email}`}</p>
                    <small>{o.properties.map((p) => p.name).join(", ") || "No properties assigned"}</small>
                  </div>
                  <button className="button secondary" onClick={() => setOwnerDraft(o)}>Edit</button>
                </div>
              ))}
            </section>
            <section className="admin-section">
              <h2>Assign properties</h2>
              {properties.map((p) => (
                <div className="setting-row" key={p.id}>
                  <strong>{p.name}</strong>
                  <select
                    value={p.ownerId || ""}
                    onChange={(e) =>
                      void run(async () => {
                        await api(`/admin/properties/${p.id}/owner`, {
                          method: "PATCH",
                          body: JSON.stringify({ ownerId: e.target.value || null }),
                        });
                        await refresh();
                      }, "Owner assignment saved.")
                    }
                  >
                    <option value="">No owner</option>
                    {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              ))}
            </section>
          </>
        )}
        {tab === "housekeeping" && (
          <>
            <h1>Housekeeping</h1>
            <section className="admin-section">
              <h2>Create task</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  await api("/admin/housekeeping", {
                    method: "POST",
                    body: JSON.stringify({ ...housekeepingDraft, reservationId: housekeepingDraft.reservationId || null }),
                  });
                  await refresh();
                }, "Housekeeping task saved.");
              }}>
                <div className="form-grid">
                  <label>Property<select required value={housekeepingDraft.propertyId} onChange={(e) => setHousekeepingDraft({ ...housekeepingDraft, propertyId: e.target.value })}><option value="">Select property</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                  <label>Due date<input type="date" required value={housekeepingDraft.dueDate} onChange={(e) => setHousekeepingDraft({ ...housekeepingDraft, dueDate: e.target.value })} /></label>
                  <label>Assignee<input value={housekeepingDraft.assigneeName} onChange={(e) => setHousekeepingDraft({ ...housekeepingDraft, assigneeName: e.target.value })} /></label>
                  <label>Status<select value={housekeepingDraft.status} onChange={(e) => setHousekeepingDraft({ ...housekeepingDraft, status: e.target.value })}>{["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}</select></label>
                </div>
                <label>Notes<textarea rows={3} value={housekeepingDraft.notes} onChange={(e) => setHousekeepingDraft({ ...housekeepingDraft, notes: e.target.value })} /></label>
                <button className="button primary" disabled={busy}>Create task</button>
              </form>
            </section>
            <section className="admin-section">
              <h2>Tasks</h2>
              {housekeeping.map((t) => (
                <div className="setting-row" key={t.id}>
                  <div><strong>{t.property?.name}</strong><p>{t.dueDate.slice(0, 10)} · {t.assigneeName || "Unassigned"} · {t.status}</p></div>
                  <select value={t.status} onChange={(e) => void run(async () => { await api(`/admin/housekeeping/${t.id}/status`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) }); await refresh(); }, "Task updated.")}>{["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}</select>
                </div>
              ))}
            </section>
          </>
        )}
        {tab === "maintenance" && (
          <>
            <h1>Maintenance</h1>
            <section className="admin-section">
              <h2>Create issue</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  await api("/admin/maintenance", {
                    method: "POST",
                    body: JSON.stringify({ ...maintenanceDraft, cost: maintenanceDraft.cost ? Number(maintenanceDraft.cost) : null }),
                  });
                  await refresh();
                }, "Maintenance issue saved.");
              }}>
                <div className="form-grid">
                  <label>Property<select required value={maintenanceDraft.propertyId} onChange={(e) => setMaintenanceDraft({ ...maintenanceDraft, propertyId: e.target.value })}><option value="">Select property</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                  <label>Title<input required value={maintenanceDraft.title} onChange={(e) => setMaintenanceDraft({ ...maintenanceDraft, title: e.target.value })} /></label>
                  <label>Priority<select value={maintenanceDraft.priority} onChange={(e) => setMaintenanceDraft({ ...maintenanceDraft, priority: e.target.value })}>{["LOW", "MEDIUM", "HIGH", "URGENT"].map((s) => <option key={s}>{s}</option>)}</select></label>
                  <label>Assignee<input value={maintenanceDraft.assigneeName} onChange={(e) => setMaintenanceDraft({ ...maintenanceDraft, assigneeName: e.target.value })} /></label>
                  <label>Cost<input type="number" min="0" value={maintenanceDraft.cost} onChange={(e) => setMaintenanceDraft({ ...maintenanceDraft, cost: e.target.value })} /></label>
                </div>
                <label>Description<textarea rows={3} value={maintenanceDraft.description} onChange={(e) => setMaintenanceDraft({ ...maintenanceDraft, description: e.target.value })} /></label>
                <button className="button primary" disabled={busy}>Create issue</button>
              </form>
            </section>
            <section className="admin-section">
              <h2>Open issues</h2>
              {maintenance.map((m) => (
                <div className="setting-row" key={m.id}>
                  <div><strong>{m.title}</strong><p>{m.property?.name} · {m.priority} · {m.status}</p></div>
                  <select value={m.status} onChange={(e) => void run(async () => { await api(`/admin/maintenance/${m.id}/status`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) }); await refresh(); }, "Issue updated.")}>{["OPEN", "IN_PROGRESS", "RESOLVED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}</select>
                </div>
              ))}
            </section>
          </>
        )}
        {(["enquiries", "reservations", "guests", "ownerLeads"] as Tab[]).includes(tab) && (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">PHASE 1 PMS</p>
                <h1>Leads, enquiries and reservations</h1>
              </div>
            </div>
            <section hidden={tab !== "reservations"} className="admin-section">
              <h2>Manual reservation</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    await api("/admin/reservations", {
                      method: "POST",
                      body: JSON.stringify(reservationDraft),
                    });
                    await refresh();
                  }, "Reservation created.");
                }}
              >
                <div className="form-grid">
                  <label>
                    Property
                    <select
                      required
                      value={reservationDraft.propertyId}
                      onChange={(e) =>
                        setReservationDraft({
                          ...reservationDraft,
                          propertyId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select property</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Source
                    <select
                      value={reservationDraft.source}
                      onChange={(e) =>
                        setReservationDraft({
                          ...reservationDraft,
                          source: e.target.value,
                        })
                      }
                    >
                      {["WHATSAPP", "AIRBNB", "BOOKING_COM", "DIRECT", "REFERRAL", "OTHER"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  {(["checkIn", "checkOut"] as const).map((k) => (
                    <label key={k}>
                      {k === "checkIn" ? "Check-in" : "Check-out"}
                      <input
                        type="date"
                        required
                        value={reservationDraft[k]}
                        onChange={(e) =>
                          setReservationDraft({
                            ...reservationDraft,
                            [k]: e.target.value,
                          })
                        }
                      />
                    </label>
                  ))}
                  <label>
                    Adults
                    <input
                      type="number"
                      min="1"
                      value={reservationDraft.adults}
                      onChange={(e) =>
                        setReservationDraft({
                          ...reservationDraft,
                          adults: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Children
                    <input
                      type="number"
                      min="0"
                      value={reservationDraft.children}
                      onChange={(e) =>
                        setReservationDraft({
                          ...reservationDraft,
                          children: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Guest name
                    <input
                      required
                      value={reservationDraft.guestName}
                      onChange={(e) =>
                        setReservationDraft({
                          ...reservationDraft,
                          guestName: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      required
                      value={reservationDraft.phone}
                      onChange={(e) =>
                        setReservationDraft({
                          ...reservationDraft,
                          phone: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <label>
                  Notes
                  <textarea
                    rows={3}
                    value={reservationDraft.notes}
                    onChange={(e) =>
                      setReservationDraft({
                        ...reservationDraft,
                        notes: e.target.value,
                      })
                    }
                  />
                </label>
                <button className="button primary" disabled={busy}>
                  Create confirmed reservation
                </button>
              </form>
            </section>
            <section hidden={tab !== "enquiries"} className="admin-section">
              <h2>Enquiries</h2>
              {phase1.enquiries.map((e) => (
                <div className="setting-row" key={e.id}>
                  <div>
                    <strong>{e.guestName}</strong>
                    <p>{e.property?.name} · {e.checkIn.slice(0, 10)} to {e.checkOut.slice(0, 10)} · {e.adults + e.children} guests · {e.phone}</p>
                    <span className="status">{e.status}</span>
                  </div>
                  <div className="row-actions">
                    <select
                      value={e.status}
                      onChange={(ev) =>
                        void run(async () => {
                          await api(`/admin/enquiries/${e.id}/status`, {
                            method: "PATCH",
                            body: JSON.stringify({ status: ev.target.value }),
                          });
                          await refresh();
                        }, "Enquiry updated.")
                      }
                    >
                      {["NEW", "CONTACTED", "AVAILABLE", "NOT_AVAILABLE", "NEGOTIATING", "CONFIRMED", "CLOSED", "CANCELLED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      className="button secondary"
                      onClick={() =>
                        setReservationDraft({
                          propertyId: e.propertyId,
                          source: "WHATSAPP",
                          checkIn: e.checkIn.slice(0, 10),
                          checkOut: e.checkOut.slice(0, 10),
                          adults: e.adults,
                          children: e.children,
                          guestName: e.guestName,
                          phone: e.phone,
                          notes: e.message || "",
                        })
                      }
                    >
                      Use for reservation
                    </button>
                    <button
                      className="button primary"
                      onClick={() =>
                        void run(async () => {
                          await api(`/admin/enquiries/${e.id}/reservation`, {
                            method: "POST",
                            body: JSON.stringify({
                              propertyId: e.propertyId,
                              source: "WHATSAPP",
                              checkIn: e.checkIn.slice(0, 10),
                              checkOut: e.checkOut.slice(0, 10),
                              adults: e.adults,
                              children: e.children,
                              guestName: e.guestName,
                              phone: e.phone,
                              notes: e.message || "",
                            }),
                          });
                          await refresh();
                        }, "Enquiry converted.")
                      }
                    >
                      Convert
                    </button>
                  </div>
                </div>
              ))}
            </section>
            <section hidden={tab !== "reservations"} className="admin-section">
              <h2>Reservations</h2>
              {phase1.reservations.map((r) => (
                <div className="setting-row" key={r.id}>
                  <div>
                    <strong>{r.guestName}</strong>
                    <p>{r.property?.name} · {r.source} · {r.checkIn.slice(0, 10)} to {r.checkOut.slice(0, 10)} · {r.status}</p>
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      void run(async () => {
                        await api(`/admin/reservations/${r.id}/status`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        await refresh();
                      }, "Reservation updated.")
                    }
                  >
                    {["TENTATIVE", "CONFIRMED", "CANCELLED", "CLOSED"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </section>
            <section hidden={tab !== "guests"} className="admin-section">
              <h2>Guests</h2>
              {phase1.guests.map((g) => (
                <div className="setting-row" key={g.id}>
                  <div>
                    <strong>{g.name}</strong>
                    <p>{g.phone}</p>
                  </div>
                </div>
              ))}
            </section>
            <section hidden={tab !== "ownerLeads"} className="admin-section">
              <h2>Owner leads</h2>
              {phase1.ownerLeads.map((l) => (
                <div className="setting-row" key={l.id}>
                  <div>
                    <strong>{l.name}</strong>
                    <p>{l.phone} · {l.email || "No email"} · {l.city || "No city"}</p>
                    <span className="status">{l.status}</span>
                  </div>
                  <select
                    value={l.status}
                    onChange={(e) =>
                      void run(async () => {
                        await api(`/admin/owner-leads/${l.id}/status`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        await refresh();
                      }, "Owner lead updated.")
                    }
                  >
                    {["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "CANCELLED"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </section>
          </>
        )}
        {tab === "locations" && (
          <>
            <h1>Locations & amenities</h1>
            <section className="admin-section">
              <h2>Locations</h2>
              {locations.map((l) => (
                <div className="setting-row" key={l.id}>
                  <div>
                    <strong>{l.name}</strong>
                    <p>
                      {l.state} · {l.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        await api(`/admin/locations/${l.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            name: l.name,
                            slug: l.slug,
                            state: l.state || "",
                            isActive: !l.isActive,
                          }),
                        });
                        await refresh();
                      }, "Location updated.")
                    }
                  >
                    {l.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    await api("/admin/locations", {
                      method: "POST",
                      body: JSON.stringify(locationDraft),
                    });
                    setLocationDraft({
                      name: "",
                      slug: "",
                      state: "",
                      isActive: true,
                    });
                    await refresh();
                  }, "Location added.");
                }}
              >
                <div className="form-grid">
                  <label>
                    Location name
                    <input
                      required
                      value={locationDraft.name}
                      onChange={(e) =>
                        setLocationDraft({
                          ...locationDraft,
                          name: e.target.value,
                          slug: slugify(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    URL slug
                    <input
                      required
                      value={locationDraft.slug}
                      onChange={(e) =>
                        setLocationDraft({
                          ...locationDraft,
                          slug: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    State / region
                    <input
                      value={locationDraft.state}
                      onChange={(e) =>
                        setLocationDraft({
                          ...locationDraft,
                          state: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <button disabled={busy} className="button primary">
                  Add location
                </button>
              </form>
            </section>
            <section className="admin-section">
              <h2>Amenities</h2>
              <p>{amenities.map((a) => a.name).join(" · ")}</p>
              <form
                className="inline-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    await api("/admin/amenities", {
                      method: "POST",
                      body: JSON.stringify({
                        name: amenityName,
                        slug: slugify(amenityName),
                      }),
                    });
                    setAmenityName("");
                    await refresh();
                  }, "Amenity added.");
                }}
              >
                <label>
                  Amenity name
                  <input
                    required
                    value={amenityName}
                    onChange={(e) => setAmenityName(e.target.value)}
                  />
                </label>
                <button className="button secondary" disabled={busy}>
                  Add amenity
                </button>
              </form>
            </section>
          </>
        )}
        {tab === "settings" && (
          <>
            <h1>Business & contact</h1>
            <p className="muted">
              These details are public. Use only approved business information.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  const { id: _id, ...data } = settings;
                  await api("/admin/settings", {
                    method: "PATCH",
                    body: JSON.stringify(data),
                  });
                  await refresh();
                }, "Business information saved.");
              }}
            >
              <fieldset disabled={busy}>
                <div className="form-grid">
                  {(
                    [
                      ["defaultWhatsappNumber", "Default WhatsApp number"],
                      ["supportPhone", "Support phone"],
                      ["supportEmail", "Support email"],
                      ["operatorName", "Operator / business name"],
                      ["businessAddress", "Business address"],
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k}>
                      {label}
                      <input
                        type={k === "supportEmail" ? "email" : "text"}
                        value={settings[k]}
                        onChange={(e) =>
                          setSettings({ ...settings, [k]: e.target.value })
                        }
                      />
                    </label>
                  ))}
                </div>
                {(
                  [
                    ["aboutText", "About the operator"],
                    ["privacyText", "Approved privacy policy"],
                    ["termsText", "Approved terms"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k}>
                    {label}
                    <textarea
                      rows={6}
                      value={settings[k]}
                      onChange={(e) =>
                        setSettings({ ...settings, [k]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <button className="button primary" disabled={busy}>
                  {busy ? "Saving…" : "Save business details"}
                </button>
              </fieldset>
            </form>
          </>
        )}
      </div>
      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Private guest preview"
      >
        <p className="notice">
          Only visible to you. This does not publish the property.
        </p>
        {preview && (
          <PropertyBody property={preview} settings={settings} preview />
        )}
      </Dialog>
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.title || "Confirm action"}
      >
        <p>{confirm?.message}</p>
        <div className="dialog-actions">
          <button className="button secondary" onClick={() => setConfirm(null)}>
            Cancel
          </button>
          <button
            className="button danger"
            disabled={busy}
            onClick={() => {
              if (confirm) {
                const action = confirm.action;
                setConfirm(null);
                void run(action, "Action completed.");
              }
            }}
          >
            Confirm
          </button>
        </div>
      </Dialog>
    </div>
  );
}
function AvailabilityCalendar({ unit }: { unit: Unit }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1),
  );
  const year = date.getUTCFullYear(),
    month = date.getUTCMonth();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return (
    <div className="availability-calendar">
      <div className="section-heading">
        <button
          className="icon-btn"
          aria-label="Previous month"
          onClick={() => setOffset((o) => o - 1)}
        >
          ‹
        </button>
        <h3>
          {date.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </h3>
        <button
          className="icon-btn"
          aria-label="Next month"
          onClick={() => setOffset((o) => o + 1)}
        >
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <strong key={d}>{d}</strong>
        ))}
        {Array.from({ length: date.getUTCDay() }, (_, i) => (
          <span key={"blank" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const blocked = unit.blocks.some(
            (b) => d >= b.startDate.slice(0, 10) && d < b.endDate.slice(0, 10),
          );
          return (
            <span
              key={d}
              className={blocked ? "blocked" : "free"}
              aria-label={`${d}: ${blocked ? "blocked" : "no block"}`}
            >
              {i + 1}
              {blocked && <small>×</small>}
            </span>
          );
        })}
      </div>
      <p className="small">
        No block · <strong className="error-text">× Blocked</strong>
      </p>
    </div>
  );
}

function StayRows({
  rows,
  run,
  refresh,
}: {
  rows: AdminReservation[];
  run: (fn: () => Promise<void>, success?: string) => Promise<void>;
  refresh: () => Promise<void>;
}) {
  if (!rows.length) return <p className="muted">No stays in this queue.</p>;
  return (
    <>
      {rows.map((r) => (
        <div className="setting-row" key={r.id}>
          <div>
            <strong>{r.guestName}</strong>
            <p>
              {r.property?.name} · {r.checkIn.slice(0, 10)} to{" "}
              {r.checkOut.slice(0, 10)} · {r.stayStatus}
            </p>
            {r.operationalNotes && <small>{r.operationalNotes}</small>}
          </div>
          <div className="row-actions">
            <button
              className="button secondary"
              disabled={r.stayStatus !== "RESERVED"}
              onClick={() =>
                void run(async () => {
                  await api(`/admin/reservations/${r.id}/check-in`, {
                    method: "POST",
                    body: JSON.stringify({ notes: "" }),
                  });
                  await refresh();
                }, "Checked in.")
              }
            >
              Mark Checked In
            </button>
            <button
              className="button secondary"
              disabled={r.stayStatus !== "CHECKED_IN"}
              onClick={() =>
                void run(async () => {
                  await api(`/admin/reservations/${r.id}/check-out`, {
                    method: "POST",
                    body: JSON.stringify({ notes: "" }),
                  });
                  await refresh();
                }, "Checked out.")
              }
            >
              Mark Checked Out
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function RoomName({
  name,
  save,
  disabled,
}: {
  name: string;
  save: (name: string) => Promise<void>;
  disabled: boolean;
}) {
  const [value, setValue] = useState(name);
  return (
    <form
      className="room-rename"
      onSubmit={(e) => {
        e.preventDefault();
        void save(value);
      }}
    >
      <label>
        Room display name
        <input
          aria-label={`Name for ${name}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={100}
          required
        />
      </label>
      <button className="text-link" disabled={disabled || value === name}>
        Save name
      </button>
    </form>
  );
}
