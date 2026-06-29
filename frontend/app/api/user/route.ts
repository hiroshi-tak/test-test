import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET() {
    const res = await apiFetch("http://localhost:8080/api/user");

    const text = await res.text();

    return NextResponse.json({ message: text });
}