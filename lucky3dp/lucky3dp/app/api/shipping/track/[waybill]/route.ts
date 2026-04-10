import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/lib/delhivery";

export async function GET(
  req: NextRequest,
  { params }: { params: { waybill: string } }
) {
  const { waybill } = params;

  if (!waybill || waybill.length < 5) {
    return NextResponse.json(
      { error: "Invalid waybill number" },
      { status: 400 }
    );
  }

  try {
    const tracking = await trackShipment(waybill);

    return NextResponse.json({
      success: true,
      tracking,
    });
  } catch (error: any) {
    console.error("Track shipment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track shipment" },
      { status: 500 }
    );
  }
}
