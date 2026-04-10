import { NextRequest, NextResponse } from "next/server";
import { checkPinServiceability } from "@/lib/delhivery";

export async function GET(
  req: NextRequest,
  { params }: { params: { pin: string } }
) {
  const { pin } = params;

  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json(
      { error: "Invalid PIN code — must be 6 digits" },
      { status: 400 }
    );
  }

  try {
    const result = await checkPinServiceability(pin);

    return NextResponse.json({
      success: true,
      pin,
      ...result,
    });
  } catch (error: any) {
    console.error("PIN serviceability error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check PIN code" },
      { status: 500 }
    );
  }
}
