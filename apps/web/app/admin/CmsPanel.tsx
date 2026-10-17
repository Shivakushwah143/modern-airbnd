"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/Icon";

type Run = (fn: () => Promise<void>, success?: string) => Promise<void>;
type Ask = (
  title: string,
  message: string,
  action: () => Promise<void>,
) => void;
type PageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  updatedAt: string;
};

const empty = {
  slug: "",
  title: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
  isPublished: false,
};

export function CmsPanel({ run, ask }: { run: Run; ask: Ask }) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [draft, setDraft] = useState<(typeof empty & { id?: string }) | null>(
    null,
  );
  const [loadError, setLoadError] = useState("");

  async function load() {
    try {
      setPages(await api<PageRow[]>("/admin/cms/pages"));
      setLoadError("");
    } catch {
      setLoadError("Content pages could not be loaded. Please retry.");
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function toggle(row: PageRow, isPublished: boolean) {
    await run(async () => {
      await api(`/admin/cms/pages/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished }),
      });
      await load();
    }, "Visibility updated.");
  }

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">CONTENT PAGES</p>
          <h1>CMS pages</h1>
        </div>
        <button
          className="button primary"
          onClick={() => setDraft(draft ? null : { ...empty })}
        >
          <Icon name="plus" /> {draft?.id ? "Editing page" : "New page"}
        </button>
      </div>
      <p className="muted small">
        Published pages appear at {"/"}their-slug on the public site. Business
        details, about text and legal copy stay in Business &amp; contact.
      </p>
      {loadError && (
        <p className="notice error" role="alert">
          {loadError}
        </p>
      )}

      {draft && (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            const { id, ...body } = draft;
            void run(async () => {
              await api(id ? `/admin/cms/pages/${id}` : "/admin/cms/pages", {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(body),
              });
              setDraft(null);
              await load();
            }, "Page saved.");
          }}
        >
          <div className="form-grid">
            <label>
              Title
              <input
                required
                maxLength={160}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              Slug (URL)
              <input
                required
                maxLength={80}
                pattern="[a-z0-9-]+"
                placeholder="faq"
                value={draft.slug}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
              />
            </label>
            <label>
              SEO title (optional)
              <input
                maxLength={170}
                value={draft.seoTitle}
                onChange={(e) =>
                  setDraft({ ...draft, seoTitle: e.target.value })
                }
              />
            </label>
            <label>
              SEO description (optional)
              <input
                maxLength={300}
                value={draft.seoDescription}
                onChange={(e) =>
                  setDraft({ ...draft, seoDescription: e.target.value })
                }
              />
            </label>
          </div>
          <label>
            Content (blank line starts a new paragraph)
            <textarea
              rows={12}
              maxLength={20000}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(e) =>
                setDraft({ ...draft, isPublished: e.target.checked })
              }
            />
            Published (visible to visitors)
          </label>
          <div className="row-actions">
            <button className="button primary" type="submit">
              Save page
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setDraft(null)}
            >
              Cancel
            </button>
          </div>
          <details className="cms-preview">
            <summary>Preview this draft</summary>
            <article className="cms-preview-sheet">
              <p className="eyebrow">/{draft.slug || "page-slug"}</p>
              <h2>{draft.title || "Page title"}</h2>
              {draft.body
                .split(/\n\s*\n/)
                .filter((paragraph) => paragraph.trim())
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </article>
          </details>
        </form>
      )}

      {pages.map((p) => (
        <div key={p.id} className="content-row">
          <div className="row-main">
            <strong>{p.title}</strong>{" "}
            <span className="muted small">/{p.slug}</span>
            <small>
              Updated {new Date(p.updatedAt).toLocaleDateString("en-IN")}
            </small>
            <span className={`badge ${p.isPublished ? "published" : "draft"}`}>
              {p.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <div className="row-actions">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={p.isPublished}
                onChange={(e) => void toggle(p, e.target.checked)}
              />
              Published
            </label>
            <a
              className="button secondary"
              href={`/${p.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>
            <button
              className="button secondary"
              onClick={() =>
                setDraft({
                  slug: p.slug,
                  title: p.title,
                  body: p.body,
                  seoTitle: p.seoTitle,
                  seoDescription: p.seoDescription,
                  isPublished: p.isPublished,
                  id: p.id,
                })
              }
            >
              Edit
            </button>
            <button
              className="button danger"
              onClick={() =>
                ask(
                  "Delete page?",
                  `/${p.slug} will be removed permanently.`,
                  async () => {
                    await api(`/admin/cms/pages/${p.id}`, {
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
      {!pages.length && !loadError && (
        <p className="muted small">No content pages yet.</p>
      )}
    </>
  );
}
