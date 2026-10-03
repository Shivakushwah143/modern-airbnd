import Link from "next/link";
export const metadata = { title: "Stay policies" };
export default function Policies() {
  return (
    <div className="container section narrow">
      <h1>Before you enquire.</h1>
      <p className="intro">
        Every property has its own house rules and stay arrangements. Read the
        policies on its property page before contacting the team.
      </p>
      <h2>Availability & enquiries</h2>
      <p>
        Availability is maintained manually. Opening WhatsApp or sending an
        enquiry does not reserve a property. Confirm availability and any
        cancellation conditions directly with the team.
      </p>
      <Link href="/properties" className="button primary">
        Explore properties
      </Link>
    </div>
  );
}
