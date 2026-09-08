import { NextResponse } from "next/server"
import { getSession } from "@/lib/google-auth"

export async function GET() { return NextResponse.json({ user: await getSession() }) }
