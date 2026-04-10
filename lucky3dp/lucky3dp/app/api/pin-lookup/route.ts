import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/pin-lookup?pin=474001
 * Fetches city/state from India Post API based on PIN code.
 */
export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin");

  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json(
      { error: "Invalid PIN code" },
      { status: 400 }
    );
  }

  try {
    // India Post API
    const res = await fetch(
      `https://api.postalpincode.in/pincode/${pin}`,
      { next: { revalidate: 86400 } } // cache 24h
    );

    const data = await res.json();

    if (
      !data ||
      !data[0] ||
      data[0].Status !== "Success" ||
      !data[0].PostOffice?.length
    ) {
      return NextResponse.json(
        { error: "PIN code not found" },
        { status: 404 }
      );
    }

    const po = data[0].PostOffice[0];

    return NextResponse.json({
      city: po.District || po.Division || "",
      state: po.State || "",
      region: po.Region || "",
      country: "India",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up PIN code" },
      { status: 500 }
    );
  }
}
