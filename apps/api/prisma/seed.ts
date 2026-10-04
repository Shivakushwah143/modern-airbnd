import { PrismaClient, type Prisma } from "@prisma/client";

const db = new PrismaClient();

const phone = "+919990000000";
const demoSlugs = [
  "demo-gurgaon-aravalli-view",
  "demo-delhi-garden-residence",
];
const propertyIds = {
  gurgaon: "11111111-1111-4111-8111-111111111111",
  delhi: "22222222-2222-4222-8222-222222222222",
};
const unitIds = {
  gurgaon: "33333333-3333-4333-8333-333333333333",
  delhi: "44444444-4444-4444-8444-444444444444",
};
const ownerIds = {
  gurgaon: "55555555-5555-4555-8555-555555555555",
  delhi: "66666666-6666-4666-8666-666666666666",
};
const guestIds = [
  "70000000-0000-4000-8000-000000000001",
  "70000000-0000-4000-8000-000000000002",
  "70000000-0000-4000-8000-000000000003",
  "70000000-0000-4000-8000-000000000004",
  "70000000-0000-4000-8000-000000000005",
];
const reservationIds = [
  "80000000-0000-4000-8000-000000000001",
  "80000000-0000-4000-8000-000000000002",
  "80000000-0000-4000-8000-000000000003",
  "80000000-0000-4000-8000-000000000004",
  "80000000-0000-4000-8000-000000000005",
];
const enquiryIds = [
  "90000000-0000-4000-8000-000000000001",
  "90000000-0000-4000-8000-000000000002",
  "90000000-0000-4000-8000-000000000003",
  "90000000-0000-4000-8000-000000000004",
  "90000000-0000-4000-8000-000000000005",
  "90000000-0000-4000-8000-000000000006",
];
const ownerLeadIds = [
  "a0000000-0000-4000-8000-000000000001",
  "a0000000-0000-4000-8000-000000000002",
  "a0000000-0000-4000-8000-000000000003",
  "a0000000-0000-4000-8000-000000000004",
];
const housekeepingIds = [
  "b0000000-0000-4000-8000-000000000001",
  "b0000000-0000-4000-8000-000000000002",
  "b0000000-0000-4000-8000-000000000003",
  "b0000000-0000-4000-8000-000000000004",
];
const maintenanceIds = [
  "c0000000-0000-4000-8000-000000000001",
  "c0000000-0000-4000-8000-000000000002",
  "c0000000-0000-4000-8000-000000000003",
  "c0000000-0000-4000-8000-000000000004",
];

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

function todayIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function asDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

const base = todayIndia();
const d = (offset: number) => addDays(base, offset);

const propertyData = [
  {
    id: propertyIds.gurgaon,
    unitId: unitIds.gurgaon,
    ownerId: ownerIds.gurgaon,
    location: ["Gurgaon", "gurgaon", "Haryana"],
    name: "Aravalli View Serviced Apartment Demo",
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
      "A spacious serviced apartment designed for work trips and family stays in Gurgaon. The home has a living lounge, equipped kitchen, quiet bedrooms, fast Wi-Fi and easy access to Golf Course Extension Road, Cyber City and local dining pockets. Demo listing for PMS review only.",
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
  },
  {
    id: propertyIds.delhi,
    unitId: unitIds.delhi,
    ownerId: ownerIds.delhi,
    location: ["Delhi", "delhi", "Delhi"],
    name: "South Delhi Garden Residence Demo",
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
      "A polished apartment in South Delhi with a relaxed living area, two comfortable bedrooms, equipped kitchen and a small balcony outlook. It is positioned for guests who want quick access to neighbourhood markets, metro connectivity, hospitals and central Delhi. Demo listing for PMS review only.",
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
  },
] as const;

async function clearDemoData() {
  const demoProperties = await db.property.findMany({
    where: {
      OR: [
        { isDemo: true },
        { id: { in: Object.values(propertyIds) } },
        { slug: { in: demoSlugs } },
      ],
    },
    select: { id: true, units: { select: { id: true } } },
  });
  const demoPropertyIds = demoProperties.map((property) => property.id);
  const demoUnitIds = demoProperties.flatMap((property) =>
    property.units.map((unit) => unit.id),
  );

  await db.housekeepingTask.deleteMany({
    where: { OR: [{ id: { in: housekeepingIds } }, { propertyId: { in: demoPropertyIds } }] },
  });
  await db.maintenanceIssue.deleteMany({
    where: { OR: [{ id: { in: maintenanceIds } }, { propertyId: { in: demoPropertyIds } }] },
  });
  await db.reservation.deleteMany({
    where: { OR: [{ id: { in: reservationIds } }, { propertyId: { in: demoPropertyIds } }] },
  });
  await db.enquiry.deleteMany({
    where: { OR: [{ id: { in: enquiryIds } }, { propertyId: { in: demoPropertyIds } }] },
  });
  await db.availabilityBlock.deleteMany({ where: { unitId: { in: demoUnitIds } } });
  await db.propertyMedia.deleteMany({ where: { propertyId: { in: demoPropertyIds } } });
  await db.externalListing.deleteMany({ where: { propertyId: { in: demoPropertyIds } } });
  await db.unit.deleteMany({ where: { propertyId: { in: demoPropertyIds } } });
  await db.property.deleteMany({
    where: { id: { in: demoPropertyIds } },
  });
  await db.ownerLead.deleteMany({ where: { id: { in: ownerLeadIds } } });
  await db.guest.deleteMany({ where: { id: { in: guestIds } } });
  await db.owner.deleteMany({ where: { id: { in: Object.values(ownerIds) } } });
}

async function createReservation(input: {
  id: string;
  propertyId: string;
  unitId: string;
  guestId: string;
  enquiryId?: string;
  source: "WHATSAPP" | "AIRBNB" | "BOOKING_COM" | "DIRECT" | "REFERRAL";
  checkIn: string;
  checkOut: string;
  guestName: string;
  phone: string;
  adults: number;
  children: number;
  stayStatus?: "RESERVED" | "CHECKED_IN" | "CHECKED_OUT";
  notes?: string;
}) {
  const block = await db.availabilityBlock.create({
    data: {
      unitId: input.unitId,
      startDate: asDate(input.checkIn),
      endDate: asDate(input.checkOut),
      reason: "BOOKED",
      note: `Demo reservation ${input.source}: ${input.guestName}`,
    },
  });
  return db.reservation.create({
    data: {
      id: input.id,
      propertyId: input.propertyId,
      unitId: input.unitId,
      guestId: input.guestId,
      enquiryId: input.enquiryId,
      source: input.source,
      status: "CONFIRMED",
      stayStatus: input.stayStatus || "RESERVED",
      checkIn: asDate(input.checkIn),
      checkOut: asDate(input.checkOut),
      adults: input.adults,
      children: input.children,
      guestName: input.guestName,
      phone: input.phone,
      notes: input.notes || "",
      operationalNotes: input.notes || "",
      checkedInAt: input.stayStatus === "CHECKED_IN" ? new Date() : null,
      checkedOutAt: input.stayStatus === "CHECKED_OUT" ? new Date() : null,
      availabilityBlockId: block.id,
    },
  });
}

try {
  await db.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      defaultWhatsappNumber: phone,
      supportPhone: phone,
      supportEmail: "hello.demo@modern-airbnd.test",
      businessAddress: "Demo operations desk, Gurgaon and Delhi",
      operatorName: "Modern Airbnd Demo Team",
      aboutText:
        "Synthetic demo workspace for reviewing managed stays, enquiries, operations and owner workflows.",
      privacyText: "Demo privacy text for local review only.",
      termsText: "Demo terms text for local review only.",
    },
    update: {
      defaultWhatsappNumber: phone,
      supportPhone: phone,
      supportEmail: "hello.demo@modern-airbnd.test",
      businessAddress: "Demo operations desk, Gurgaon and Delhi",
      operatorName: "Modern Airbnd Demo Team",
      aboutText:
        "Synthetic demo workspace for reviewing managed stays, enquiries, operations and owner workflows.",
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
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_PRODUCTION_DEMO_SEED !== "true"
    ) {
      throw new Error("Set ALLOW_PRODUCTION_DEMO_SEED=true to demo seed production.");
    }

    await clearDemoData();

    await db.owner.createMany({
      data: [
        {
          id: ownerIds.gurgaon,
          name: "Demo Owner Aditi Mehra",
          phone: "+919990001001",
          email: "aditi.owner.demo@modern-airbnd.test",
          notes: "Synthetic owner for Gurgaon demo property.",
        },
        {
          id: ownerIds.delhi,
          name: "Demo Owner Rohan Kapoor",
          phone: "+919990001002",
          email: "rohan.owner.demo@modern-airbnd.test",
          notes: "Synthetic owner for Delhi demo property.",
        },
      ],
    });

    const amenityRows = await db.amenity.findMany({
      where: {
        slug: {
          in: amenities.map((a) => a.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
        },
      },
    });

    for (const demo of propertyData) {
      const [locationName, locationSlug, state] = demo.location;
      const location = await db.location.upsert({
        where: { slug: locationSlug },
        create: { name: locationName, slug: locationSlug, state },
        update: { name: locationName, state, isActive: true },
      });
      await db.property.create({
        data: {
          id: demo.id,
          ownerId: demo.ownerId,
          name: demo.name,
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
          whatsappNumber: phone,
          houseRules: demo.houseRules,
          localHighlights: demo.localHighlights,
          suitedFor: demo.suitedFor,
          checkInInfo: "Coordinated check-in after 2 PM.",
          checkOutInfo: "Standard check-out by 11 AM.",
          propertyNotes: "Synthetic demo property. Not a real listing.",
          seoTitle: `${demo.name} | Modern Airbnd Demo`,
          seoDescription: demo.shortDescription,
          isDemo: true,
          status: "PUBLISHED",
          publishedAt: new Date(),
          units: {
            create: {
              id: demo.unitId,
              name: "Entire Property",
              isEntireProperty: true,
            },
          },
          amenities: {
            connect: amenityRows.slice(0, 8).map((a) => ({ id: a.id })),
          },
        },
      });
      await db.propertyMedia.createMany({
        data: demo.images.map(([secureUrl, altText], index) => ({
          propertyId: demo.id,
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
    }

    const guests = [
      ["Demo Guest Kavya Rao", "+919990002001", "kavya.guest.demo@modern-airbnd.test"],
      ["Demo Guest Arjun Sen", "+919990002002", "arjun.guest.demo@modern-airbnd.test"],
      ["Demo Guest Meera Iyer", "+919990002003", "meera.guest.demo@modern-airbnd.test"],
      ["Demo Guest Kabir Malhotra", "+919990002004", "kabir.guest.demo@modern-airbnd.test"],
      ["Demo Guest Naina Shah", "+919990002005", "naina.guest.demo@modern-airbnd.test"],
    ] as const;
    await db.guest.createMany({
      data: guests.map(([name, guestPhone, email], index) => ({
        id: guestIds[index],
        name,
        phone: guestPhone,
        email,
        notes: "Synthetic PMS demo guest.",
      })),
    });

    const enquiries = [
      ["NEW", propertyIds.gurgaon, 0, d(2), d(5), "Needs early check-in for a work trip."],
      ["CONTACTED", propertyIds.delhi, 1, d(4), d(7), "Asked about lift access and parking."],
      ["AVAILABLE", propertyIds.gurgaon, 2, d(8), d(11), "Dates available, awaiting confirmation."],
      ["NOT_AVAILABLE", propertyIds.delhi, 3, d(1), d(3), "Requested dates overlap another stay."],
      ["NEGOTIATING", propertyIds.delhi, 4, d(14), d(18), "Discussing longer stay terms."],
      ["CONFIRMED", propertyIds.gurgaon, 0, d(20), d(23), "Converted to future referral reservation."],
    ] as const;
    await db.enquiry.createMany({
      data: enquiries.map(([status, propertyId, guestIndex, checkIn, checkOut, message], index) => ({
        id: enquiryIds[index],
        propertyId,
        guestId: guestIds[guestIndex],
        status,
        checkIn: asDate(checkIn),
        checkOut: asDate(checkOut),
        adults: index % 2 === 0 ? 2 : 1,
        children: index === 2 ? 1 : 0,
        guestName: guests[guestIndex][0],
        phone: guests[guestIndex][1],
        message,
        source: "WHATSAPP",
      })),
    });

    const reservations = [
      [reservationIds[0], propertyIds.gurgaon, unitIds.gurgaon, 0, "WHATSAPP", d(0), d(3), "RESERVED", undefined],
      [reservationIds[1], propertyIds.delhi, unitIds.delhi, 1, "AIRBNB", d(-3), d(0), "CHECKED_IN", undefined],
      [reservationIds[2], propertyIds.gurgaon, unitIds.gurgaon, 2, "BOOKING_COM", d(6), d(9), "RESERVED", undefined],
      [reservationIds[3], propertyIds.delhi, unitIds.delhi, 3, "DIRECT", d(10), d(13), "RESERVED", undefined],
      [reservationIds[4], propertyIds.gurgaon, unitIds.gurgaon, 4, "REFERRAL", d(20), d(23), "RESERVED", enquiryIds[5]],
    ] as const;
    for (const [id, propertyId, unitId, guestIndex, source, checkIn, checkOut, stayStatus, enquiryId] of reservations) {
      await createReservation({
        id,
        propertyId,
        unitId,
        guestId: guestIds[guestIndex],
        enquiryId,
        source,
        checkIn,
        checkOut,
        guestName: guests[guestIndex][0],
        phone: guests[guestIndex][1],
        adults: guestIndex === 3 ? 3 : 2,
        children: guestIndex === 2 ? 1 : 0,
        stayStatus,
        notes: "Synthetic confirmed demo stay.",
      });
    }

    await db.ownerLead.createMany({
      data: [
        {
          id: ownerLeadIds[0],
          status: "NEW",
          name: "Demo Lead Priya Bansal",
          phone: "+919990003001",
          email: "priya.lead.demo@modern-airbnd.test",
          city: "Gurgaon",
          propertyType: "3BHK apartment",
          message: "Wants co-hosting for a vacant apartment.",
        },
        {
          id: ownerLeadIds[1],
          status: "CONTACTED",
          name: "Demo Lead Dev Khanna",
          phone: "+919990003002",
          email: "dev.lead.demo@modern-airbnd.test",
          city: "Delhi",
          propertyType: "Builder floor",
          message: "Asked about managed stays for visiting families.",
        },
        {
          id: ownerLeadIds[2],
          status: "QUALIFIED",
          name: "Demo Lead Sana Verma",
          phone: "+919990003003",
          email: "sana.lead.demo@modern-airbnd.test",
          city: "Delhi",
          propertyType: "Serviced apartment",
          message: "Property photos and access details received.",
        },
        {
          id: ownerLeadIds[3],
          status: "CLOSED",
          name: "Demo Lead Ishaan Suri",
          phone: "+919990003004",
          email: "ishaan.lead.demo@modern-airbnd.test",
          city: "Gurgaon",
          propertyType: "Studio apartment",
          message: "Not moving ahead this quarter.",
        },
      ],
    });

    await db.housekeepingTask.createMany({
      data: [
        {
          id: housekeepingIds[0],
          propertyId: propertyIds.delhi,
          reservationId: reservationIds[1],
          assigneeName: "Demo Housekeeper Rekha",
          dueDate: asDate(d(0)),
          status: "PENDING",
          notes: "Checkout clean and linen refresh.",
        },
        {
          id: housekeepingIds[1],
          propertyId: propertyIds.gurgaon,
          reservationId: reservationIds[0],
          assigneeName: "Demo Housekeeper Imran",
          dueDate: asDate(d(0)),
          status: "IN_PROGRESS",
          notes: "Pre-arrival pantry and bathroom check.",
        },
        {
          id: housekeepingIds[2],
          propertyId: propertyIds.gurgaon,
          reservationId: reservationIds[2],
          assigneeName: "Demo Housekeeper Rekha",
          dueDate: asDate(d(5)),
          status: "PENDING",
          notes: "Prepare for upcoming family stay.",
        },
        {
          id: housekeepingIds[3],
          propertyId: propertyIds.delhi,
          reservationId: null,
          assigneeName: "Demo Housekeeper Imran",
          dueDate: asDate(d(-1)),
          status: "DONE",
          notes: "Balcony and kitchen deep clean completed.",
        },
      ],
    });

    await db.maintenanceIssue.createMany({
      data: [
        {
          id: maintenanceIds[0],
          propertyId: propertyIds.gurgaon,
          title: "Bedroom AC cooling slow",
          description: "Guest reported slower cooling in the second bedroom.",
          priority: "HIGH",
          assigneeName: "Demo Technician Amit",
          status: "OPEN",
          cost: new Prisma.Decimal(0),
          notes: "Visit requested before next check-in.",
        },
        {
          id: maintenanceIds[1],
          propertyId: propertyIds.delhi,
          title: "Kitchen cabinet hinge loose",
          description: "Lower cabinet hinge needs tightening.",
          priority: "MEDIUM",
          assigneeName: "Demo Technician Farah",
          status: "IN_PROGRESS",
          cost: new Prisma.Decimal(850),
          notes: "Part arranged.",
        },
        {
          id: maintenanceIds[2],
          propertyId: propertyIds.gurgaon,
          title: "Router replacement completed",
          description: "Old router replaced after intermittent drops.",
          priority: "LOW",
          assigneeName: "Demo Technician Amit",
          status: "RESOLVED",
          cost: new Prisma.Decimal(2400),
          notes: "Speed verified.",
        },
        {
          id: maintenanceIds[3],
          propertyId: propertyIds.delhi,
          title: "Urgent geyser inspection",
          description: "Preventive inspection before longer stay.",
          priority: "URGENT",
          assigneeName: "",
          status: "OPEN",
          cost: null,
          notes: "Assign technician today.",
        },
      ],
    });
  }

  console.log(
    "Modern Airbnd seed complete. Demo inventory:",
    process.env.SEED_DEMO === "true",
  );
} finally {
  await db.$disconnect();
}
