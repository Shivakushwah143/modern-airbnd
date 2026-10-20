# Demo portfolio content

The single `/portfolio` page has a temporary display-only demo layer. It does not create database rows, real administrators, user accounts, booking inventory or customer endorsements.

## Replace it with real content

Use `/admin/portfolio` to publish real team profiles, case studies and owner testimonials. Each populated live section automatically replaces its whole demo section. One published real team member removes all sample team profiles; one published real testimonial removes all sample testimonials. A real case study replaces all demo cases.

Publish real properties through `/admin/listings` and enable their portfolio visibility. When managed cities are returned by the public portfolio API, the sample property collection disappears. Demo properties never appear in guest search or accept bookings.

Screenshots and videos must use the existing testimonial consent and publishing controls. The demo screenshots and motion-graphic clip are visibly marked as examples. The video has player controls, captions and a transcript; it has no fabricated spoken endorsement.

## Edit or disable samples

- `apps/web/lib/demo-portfolio.ts`: all sample names, roles, copy, property information, media references, case studies and section replacement rules.
- `apps/web/public/demo/portfolio/`: six generated WebP illustrations, two labeled SVG screenshot examples, the WebM preview and its captions.
- `apps/web/components/DemoPortfolioTeam.tsx`: the featured fictional super-admin profile and illustrative team-work section. This creates no actual admin privileges.
- Set `PORTFOLIO_DEMO_CONTENT=false` in the root `.env` and restart the web server to disable every demo fallback immediately. The default is enabled while sections have no published content.

An API outage retains its visible retry notice. If demos are enabled, the page can still display clearly labeled examples while the live service recovers. Real records are never overwritten or supplemented with fictional records within the same section.

## Image provenance

The leadership/team portraits, work scene and two property interiors were generated for this demo. They are fictional illustrations, not photographs of employees, owners or actual managed properties. All final assets are stored locally in the project and optimized as WebP. Replace them with approved real photographs when publishing real content.
