import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
try {
  await db.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
  for (const name of [
    "Wi-Fi",
    "Kitchen",
    "Parking",
    "Air conditioning",
    "Workspace",
    "Washing machine",
  ]) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await db.amenity.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
  }
  for (const [name, slug, state] of [
    ["Gurgaon", "gurgaon", "Haryana"],
    ["Delhi", "delhi", "Delhi"],
    ["Indore", "indore", "Madhya Pradesh"],
  ]) {
    const location = await db.location.upsert({
      where: { slug },
      create: { name, slug, state },
      update: {},
    });
    if (process.env.SEED_DEMO === "true") {
      if (process.env.NODE_ENV === "production")
        throw new Error("Demo seeding is prohibited in production.");
      await db.property.upsert({
        where: { slug: `demo-${slug}-apartment` },
        update: {},
        create: {
          name: `${name} Courtyard · Demo`,
          slug: `demo-${slug}-apartment`,
          locationId: location.id,
          description:
            "Fictional demonstration inventory for exploring the application. This is not a real property and cannot be enquired about. Replace demo inventory with your own property records and real photographs before launch.",
          shortDescription: "Demonstration apartment — not a real listing.",
          area: "Demo neighbourhood",
          bedrooms: 2,
          bathrooms: 2,
          beds: 2,
          maxGuests: 4,
          isDemo: true,
          status: "PUBLISHED",
          units: {
            create: { name: "Entire Property", isEntireProperty: true },
          },
          houseRules: ["Demonstration record only."],
          amenities: {
            connect: (await db.amenity.findMany({ take: 3 })).map((a) => ({
              id: a.id,
            })),
          },
        },
      });
    }
  }
  console.log(
    "Modern Airbnd seed complete. Demo inventory:",
    process.env.SEED_DEMO === "true",
  );
} finally {
  await db.$disconnect();
}
