import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projects, notes, meetings, credentials } from '@/drizzle/schema'

export async function POST() {
  try {
    // Wipe all existing data (cascade handles notes/meetings/credentials)
    await db.delete(projects)

    // ── NCA ─────────────────────────────────────────────────────────────────
    const [nca] = await db.insert(projects).values({
      name: 'NCA',
      description: 'Central credentials vault for NCA organization.',
    }).returning()

    await db.insert(credentials).values([
      {
        projectId: nca.id,
        label: 'AWS Infrastructure Root',
        username: 'prayag4711@gmail.com',
        password: 'VidyaNca96@',
        url: 'https://d-9d675f1774.awsapps.com/start/#/',
        notes: 'Root account. IAM/SSO login URL above.',
      },
      {
        projectId: nca.id,
        label: 'Razorpay Live',
        username: 'vidyahej999@gmail.com / +918123283217',
        password: 'rzp_live_S9GHZvwxvr3ZXy',
        url: 'https://dashboard.razorpay.com',
        notes: 'Webhook Secret: ncamadeeasywebhooksecret',
      },
      {
        projectId: nca.id,
        label: 'PostgreSQL Database',
        username: 'pgadmin',
        password: 'root',
        url: '18.191.238.59:5432/nca',
        notes: 'DATABASE_URL: postgresql://pgadmin:root@18.191.238.59:5432/nca\nNEXTAUTH_SECRET: ncamadeeasysecret',
      },
      {
        projectId: nca.id,
        label: 'Resend API',
        username: '',
        password: 're_ZCopzbJJ_G8QcHgAPiHwNk6V2HJ7VNtuu',
        url: 'https://resend.com',
        notes: 'API Key for transactional email',
      },
      {
        projectId: nca.id,
        label: 'Namesquare Domain',
        username: 'vidyahej999@gmail.com',
        password: 'VidyaNca96@',
        url: 'https://www.namesquare.com',
        notes: 'Domain registrar account',
      },
    ])

    // ── LuminousLogics ───────────────────────────────────────────────────────
    const [ll] = await db.insert(projects).values({
      name: 'LuminousLogics',
      description: 'Central credentials vault for LuminousLogics organization.',
    }).returning()

    await db.insert(credentials).values([
      {
        projectId: ll.id,
        label: 'Azure DevOps',
        username: 'luminouslogics@gmail.com',
        password: 'Alan@1234',
        url: 'https://dev.azure.com/luminouslogics/Plane%20and%20Prop/',
        notes: 'Plane and Prop project',
      },
      {
        projectId: ll.id,
        label: 'GitHub Organization',
        username: 'Luminous-Logics',
        password: 'Luminous_Logics@123',
        url: 'https://github.com/Luminous-Logics',
        notes: 'GitHub org account',
      },
      {
        projectId: ll.id,
        label: "Alan's Email",
        username: 'alan@luminouslogics.com',
        password: 'LuminousLogics070924',
        url: '',
        notes: 'Personal company email access',
      },
      {
        projectId: ll.id,
        label: 'Titan Email — Primary Admin',
        username: 'luminouslogics@gmail.com',
        password: 'LuminousLogics070924',
        url: 'https://secureserver.titan.email/mail/',
        notes: 'Primary admin on Titan mail portal',
      },
      {
        projectId: ll.id,
        label: 'Titan Email — Sales Contact',
        username: 'contact@luminouslogics.com',
        password: 'LuminousLogics070924',
        url: 'https://secureserver.titan.email/mail/',
        notes: 'Sales contact email on Titan mail portal',
      },
      {
        projectId: ll.id,
        label: 'Cloudflare',
        username: 'contact@luminouslogics.com',
        password: 'LuminousLogics070924@',
        url: 'https://dash.cloudflare.com',
        notes: 'DNS & domain management',
      },
    ])

    // ── AlSabahHVAC ──────────────────────────────────────────────────────────
    const [hvac] = await db.insert(projects).values({
      name: 'AlSabahHVAC',
      description: 'Central credentials vault for AlSabahHVAC organization.',
    }).returning()

    await db.insert(credentials).values([
      {
        projectId: hvac.id,
        label: 'GoDaddy Hosting',
        username: 'SabahHVAC',
        password: 'SabahKuwait@2024',
        url: 'https://sso.godaddy.com',
        notes: 'Hosting account on GoDaddy',
      },
    ])

    return NextResponse.json({
      success: true,
      message: 'Vault seeded: NCA (5), LuminousLogics (6), AlSabahHVAC (1)',
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Seed failed', details: String(err) }, { status: 500 })
  }
}
