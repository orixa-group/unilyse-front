import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Point d’entrée tRPC à brancher lorsque le routeur sera ajouté.",
    status: "not_configured",
  });
}
