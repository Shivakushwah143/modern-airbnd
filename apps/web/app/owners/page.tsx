import { OwnerLeadForm } from "./OwnerLeadForm";

export const metadata = {
  title: "List your property | Modern Airbnd",
  description: "Co-hosting and managed stay services for property owners.",
};

export default function Owners() {
  return (
    <main className="container section">
      <section className="owner-hero">
        <p className="eyebrow">FOR PROPERTY OWNERS</p>
        <h1>Managed stays without building an operations team.</h1>
        <p className="intro">
          Modern Airbnd helps owners present, manage and convert stay enquiries
          through a direct, human-led process.
        </p>
      </section>
      <section className="admin-section">
        <h2>Co-hosting services</h2>
        <div className="how-grid">
          {[
            ["Property page setup", "Photos, stay details, trust signals and guest-ready content."],
            ["Enquiry handling", "Guest conversations are captured before WhatsApp follow-up."],
            ["Calendar control", "Confirmed reservations block availability in the PMS."],
            ["Channel support", "Manual records for WhatsApp, Airbnb, Booking.com, direct and referral stays."],
          ].map(([title, copy]) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="admin-section">
        <h2>How it works</h2>
        <div className="how-grid">
          {[
            ["01", "Share property details", "Send location, capacity, stay rules and current booking channels."],
            ["02", "We prepare the listing", "The team builds property content and reviews availability setup."],
            ["03", "Guests enquire", "Qualified stay enquiries are saved and followed up on WhatsApp."],
            ["04", "Reservations update inventory", "Confirmed stays are recorded and block the right inventory."],
          ].map(([n, title, copy]) => (
            <div key={n}>
              <span className="step-number">{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="admin-section">
        <h2>Proof and managed properties</h2>
        <p className="muted">
          Public property pages can show verified external listing proof,
          reviews and managed-property details approved by the team.
        </p>
      </section>
      <section className="admin-section">
        <h2>FAQ</h2>
        {[
          ["Do guests book online?", "No. This phase uses saved enquiries and direct team confirmation."],
          ["Are payments collected here?", "No. Payments are outside this phase."],
          ["Do you sync OTAs?", "No API sync in this phase. Staff can manually record external reservations."],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className="admin-section">
        <h2>Start a conversation</h2>
        <OwnerLeadForm />
      </section>
    </main>
  );
}
