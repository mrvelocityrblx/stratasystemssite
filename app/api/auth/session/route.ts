import { NextResponse } from "next/server"
import { getSession } from "@/lib/credential-auth"

export async function GET() { return NextResponse.json({ user: await getSession() }) }
