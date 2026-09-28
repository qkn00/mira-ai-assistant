import { db } from "@/db";
import { avatarProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const personaNames = {
  selin: "Selin",
  alara: "Alara",
  defne: "Defne",
  leyla: "Leyla",
} as const;
const allowedPersonas = Object.keys(personaNames) as (keyof typeof personaNames)[];
const allowedLooks = ["midnight", "ivory", "sage"] as const;
type PersonaId = keyof typeof personaNames;

async function getOrCreateProfile() {
  const [profile] = await db.select().from(avatarProfiles).limit(1);

  if (profile) {
    return profile;
  }

  const [created] = await db
    .insert(avatarProfiles)
    .values({ displayName: "Selin", activeLook: "midnight", activePersona: "selin" })
    .returning();

  return created;
}

export async function GET() {
  try {
    const profile = await getOrCreateProfile();
    return NextResponse.json({
      name: profile.displayName,
      activeLook: profile.activeLook,
      activePersona: profile.activePersona,
      adultMode: profile.adultMode,
    });
  } catch (error) {
    console.error("Unable to load avatar profile", error);
    return NextResponse.json(
      { name: "Selin", activeLook: "midnight", activePersona: "selin", adultMode: false },
      { status: 200 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      activeLook?: string;
      activePersona?: string;
      adultMode?: unknown;
    };
    const updates: {
      activeLook?: string;
      activePersona?: PersonaId;
      adultMode?: boolean;
      displayName?: string;
      updatedAt: Date;
    } = { updatedAt: new Date() };
    let hasChanges = false;

    if (body.activeLook !== undefined) {
      if (!allowedLooks.includes(body.activeLook as (typeof allowedLooks)[number])) {
        return NextResponse.json({ error: "Geçersiz kıyafet seçimi." }, { status: 400 });
      }
      updates.activeLook = body.activeLook;
      hasChanges = true;
    }

    if (body.activePersona !== undefined) {
      if (!allowedPersonas.includes(body.activePersona as PersonaId)) {
        return NextResponse.json({ error: "Geçersiz avatar seçimi." }, { status: 400 });
      }
      const activePersona = body.activePersona as PersonaId;
      updates.activePersona = activePersona;
      updates.displayName = personaNames[activePersona];
      hasChanges = true;
    }

    if (body.adultMode !== undefined) {
      if (typeof body.adultMode !== "boolean") {
        return NextResponse.json({ error: "Yetişkin modu seçimi geçersiz." }, { status: 400 });
      }
      updates.adultMode = body.adultMode;
      hasChanges = true;
    }

    if (!hasChanges) {
      return NextResponse.json({ error: "Güncellenecek tercih bulunamadı." }, { status: 400 });
    }

    const profile = await getOrCreateProfile();
    const [updated] = await db
      .update(avatarProfiles)
      .set(updates)
      .where(eq(avatarProfiles.id, profile.id))
      .returning();

    return NextResponse.json({
      name: updated.displayName,
      activePersona: updated.activePersona,
      adultMode: updated.adultMode,
    });
  } catch (error) {
    console.error("Unable to update avatar profile", error);
    return NextResponse.json({ error: "Tercih kaydedilemedi." }, { status: 500 });
  }
}
