import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const amenities = [
  "Wi-Fi",
  "Kitchen",
  "Parking",
  "Air conditioning",
  "Workspace",
  "Washing machine",
  "Power backup",
  "Smart TV",
  "Balcony",
  "Lift",
];

const demoProperties = [
  {
    location: ["Gurgaon", "gurgaon", "Haryana"],
    name: "Aravalli View Serviced Apartment",
    slug: "demo-gurgaon-aravalli-view",
    area: "Golf Course Extension Road",
    propertyType: "Serviced apartment",
    bedrooms: 3,
    bathrooms: 3,
    beds: 3,
    maxGuests: 6,
    shortDescription:
      "A bright Gurgaon serviced apartment near business hubs and cafes.",
    description:
      "A spacious demonstration serviced apartment designed for work trips and family stays in Gurgaon. The home has a living lounge, a practical kitchen, quiet bedrooms, high-speed Wi-Fi and easy access to Golf Course Extension Road, Cyber City and local dining pockets. This is demo inventory for local development.",
    localHighlights: [
      {
        name: "Business access",
        detail: "Easy drive to Cyber City, Golf Course Road and Sohna Road.",
      },
      {
        name: "Daily convenience",
        detail: "Cafes, grocery stores and pharmacies are close by.",
      },
      {
        name: "Green breaks",
        detail: "Aravalli-side walking pockets are reachable by car.",
      },
    ],
    houseRules: [
      "Government ID required at check-in.",
      "Quiet hours after 10 PM.",
      "No parties or events.",
      "Smoking only in designated outdoor areas.",
    ],
    suitedFor: ["Business travel", "Family stays", "Medical visits"],
    images: [
      [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
        "Warm living room with natural light",
      ],
      [
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "Contemporary apartment lounge",
      ],
      [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
        "Modern residential exterior",
      ],
      [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
        "Comfortable bedroom with neutral decor",
      ],
    ],
    blocks: [["2099-02-10", "2099-02-12", "Owner maintenance window"]],
  },
  {
    location: ["Delhi", "delhi", "Delhi"],
    name: "South Delhi Garden Residence",
    slug: "demo-delhi-garden-residence",
    area: "Greater Kailash",
    propertyType: "Entire apartment",
    bedrooms: 2,
    bathrooms: 2,
    beds: 2,
    maxGuests: 4,
    shortDescription:
      "A calm South Delhi apartment close to markets, metro and parks.",
    description:
      "A polished demonstration apartment in South Delhi with a relaxed living area, two comfortable bedrooms, equipped kitchen and a small balcony outlook. It is positioned for guests who want quick access to neighbourhood markets, metro connectivity, hospitals and central Delhi. This is demo inventory for local development.",
    localHighlights: [
      {
        name: "Neighbourhood markets",
        detail: "GK markets, cafes and restaurants are a short ride away.",
      },
      {
        name: "Metro access",
        detail: "Useful connections to central and south Delhi corridors.",
      },
      {
        name: "Errands nearby",
        detail: "Daily essentials, clinics and pharmacies are close by.",
      },
    ],
    houseRules: [
      "Government ID required at check-in.",
      "No loud music after 10 PM.",
      "Visitors must be approved by the host.",
      "Keep shared building areas clean.",
    ],
    suitedFor: ["Family visits", "Short relocations", "Hospital visits"],
    images: [
      [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80",
        "Elegant apartment living and dining room",
      ],
      [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
        "Modern bedroom with soft furnishings",
      ],
      [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
        "Open plan living space",
      ],
      [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "Apartment kitchen and dining detail",
      ],
    ],
    blocks: [["2099-03-18", "2099-03-21", "Demo confirmed reservation"]],
  },
] as const;

try {
  await db.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      defaultWhatsappNumber: "+919876543210",
      operatorName: "Modern Airbnd Demo Team",
    },
    update: {
      defaultWhatsappNumber: "+919876543210",
      operatorName: "Modern Airbnd Demo Team",
    },
  });

  for (const name of amenities) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await db.amenity.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });
  }

  for (const [name, slug, state] of [
    ["Gurgaon", "gurgaon", "Haryana"],
    ["Delhi", "delhi", "Delhi"],
  ]) {
    await db.location.upsert({
      where: { slug },
      create: { name, slug, state },
      update: { name, state, isActive: true },
    });
  }

  if (process.env.SEED_DEMO === "true") {
    if (process.env.NODE_ENV === "production")
      throw new Error("Demo seeding is prohibited in production.");

    const oldDemo = await db.property.findMany({
      where: { isDemo: true },
      select: { id: true, units: { select: { id: true } } },
    });
    const demoIds = oldDemo.map((p) => p.id);
    const unitIds = oldDemo.flatMap((p) => p.units.map((u) => u.id));

    if (demoIds.length) {
      await db.availabilityBlock.deleteMany({
        where: { unitId: { in: unitIds } },
      });
      await db.housekeepingTask.deleteMany({
        where: { propertyId: { in: demoIds } },
      });
      await db.maintenanceIssue.deleteMany({
        where: { propertyId: { in: demoIds } },
      });
      await db.reservation.deleteMany({
        where: { propertyId: { in: demoIds } },
      });
      await db.enquiry.deleteMany({ where: { propertyId: { in: demoIds } } });
      await db.propertyMedia.deleteMany({
        where: { propertyId: { in: demoIds } },
      });
      await db.externalListing.deleteMany({
        where: { propertyId: { in: demoIds } },
      });
      await db.unit.deleteMany({ where: { propertyId: { in: demoIds } } });
      await db.property.deleteMany({ where: { id: { in: demoIds } } });
    }

    const amenityRows = await db.amenity.findMany({
      where: {
        slug: {
          in: amenities.map((a) => a.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
        },
      },
    });

    for (const demo of demoProperties) {
      const [locationName, locationSlug, state] = demo.location;
      const location = await db.location.upsert({
        where: { slug: locationSlug },
        create: { name: locationName, slug: locationSlug, state },
        update: { name: locationName, state, isActive: true },
      });
      const property = await db.property.create({
        data: {
          name: `${demo.name} · Demo`,
          slug: demo.slug,
          locationId: location.id,
          area: demo.area,
          propertyType: demo.propertyType,
          shortDescription: demo.shortDescription,
          description: demo.description,
          bedrooms: demo.bedrooms,
          bathrooms: demo.bathrooms,
          beds: demo.beds,
          maxGuests: demo.maxGuests,
          whatsappNumber: "+919876543210",
          houseRules: demo.houseRules,
          localHighlights: demo.localHighlights,
          suitedFor: demo.suitedFor,
          checkInInfo: "Flexible check-in after 2 PM, coordinated on WhatsApp.",
          checkOutInfo: "Standard check-out by 11 AM.",
          propertyNotes: "Demo property for local development only.",
          seoTitle: `${demo.name} | Modern Airbnd Demo`,
          seoDescription: demo.shortDescription,
          isDemo: true,
          status: "PUBLISHED",
          publishedAt: new Date(),
          units: {
            create: { name: "Entire Property", isEntireProperty: true },
          },
          amenities: {
            connect: amenityRows.slice(0, 8).map((a) => ({ id: a.id })),
          },
        },
        include: { units: true },
      });

      await db.propertyMedia.createMany({
        data: demo.images.map(([secureUrl, altText], index) => ({
          propertyId: property.id,
          cloudinaryPublicId: `demo/${demo.slug}/${index + 1}`,
          secureUrl,
          format: "jpg",
          width: 1400,
          height: 933,
          bytes: 500000,
          altText,
          sortOrder: index,
          isCover: index === 0,
        })),
      });

      const unit = property.units[0];
      await db.availabilityBlock.createMany({
        data: demo.blocks.map(([startDate, endDate, note]) => ({
          unitId: unit.id,
          startDate: new Date(`${startDate}T00:00:00.000Z`),
          endDate: new Date(`${endDate}T00:00:00.000Z`),
          reason: "BOOKED",
          note,
        })),
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
