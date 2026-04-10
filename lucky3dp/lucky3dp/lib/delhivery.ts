/**
 * Delhivery API Client
 *
 * Handles all communication with Delhivery's REST APIs.
 * Uses DELHIVERY_API_TOKEN and DELHIVERY_BASE_URL from env.
 *
 * Docs: https://track.delhivery.com/api/
 */

const getToken = () => process.env.DELHIVERY_API_TOKEN || "";
const getBase = () => process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com/api";

interface DelhiveryHeaders {
  Authorization: string;
  "Content-Type": string;
  Accept: string;
}

function headers(): DelhiveryHeaders {
  return {
    Authorization: `Token ${getToken()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/* ─── Shipment Payload ────────────────────────────────── */

export interface ShipmentPayload {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
  orderNumber: string;
  paymentMode: "Prepaid" | "COD";
  totalAmount: number;
  productDescription: string;
  quantity: number;
  weight: number;       // grams
  length: number;       // cm
  breadth: number;      // cm
  height: number;       // cm
}

/* A4 poster defaults: ~100g per poster, A4 envelope dimensions */
export const A4_POSTER_DEFAULTS = {
  weight: 150,    // grams (poster + packaging)
  length: 32,     // cm
  breadth: 23,    // cm
  height: 2,      // cm (flat envelope)
};

export function calcPosterWeight(qty: number): number {
  return 80 + qty * 30; // base packaging 80g + 30g per poster
}

export function calcPosterHeight(qty: number): number {
  return Math.max(1, Math.ceil(qty * 0.3)); // ~0.3cm per poster
}

/* ─── Create Shipment ─────────────────────────────────── */

export async function createShipment(payload: ShipmentPayload) {
  const shipmentData = {
    shipments: [
      {
        name: payload.name,
        add: payload.addressLine1,
        add2: payload.addressLine2 || "",
        city: payload.city,
        state: payload.state,
        pin: payload.pinCode,
        country: payload.country || "India",
        phone: payload.phone,
        order: payload.orderNumber,
        payment_mode: payload.paymentMode,
        total_amount: payload.totalAmount,
        cod_amount: payload.paymentMode === "COD" ? payload.totalAmount : 0,
        product_desc: payload.productDescription,
        quantity: payload.quantity,
        weight: payload.weight,
        shipment_length: payload.length,
        shipment_width: payload.breadth,
        shipment_height: payload.height,
      },
    ],
    pickup_location: {
      name: "Lucky 3DP HQ",
      // Configure pickup address in Delhivery dashboard
    },
  };

  const formBody = `format=json&data=${encodeURIComponent(JSON.stringify(shipmentData))}`;

  const res = await fetch(`${getBase()}/cmu/create.json`, {
    method: "POST",
    headers: {
      Authorization: `Token ${getToken()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: formBody,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delhivery create shipment failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  // Delhivery returns success with packages array
  if (!data.success || !data.packages?.length) {
    const errMsg = data.rmk || data.packages?.[0]?.remarks?.[0] || "Unknown error";
    throw new Error(`Delhivery rejected shipment: ${errMsg}`);
  }

  const pkg = data.packages[0];
  return {
    waybill: pkg.waybill,
    status: pkg.status,
    remarks: pkg.remarks || [],
    refnum: pkg.refnum,
    cashToCollect: pkg.cash_to_collect,
  };
}

/* ─── Track Shipment ──────────────────────────────────── */

export interface TrackingResult {
  waybill: string;
  currentStatus: string;
  currentStatusTime: string;
  origin: string;
  destination: string;
  scans: {
    status: string;
    location: string;
    timestamp: string;
    instructions: string;
  }[];
  estimatedDelivery?: string;
  delivered: boolean;
}

export async function trackShipment(waybill: string): Promise<TrackingResult> {
  const res = await fetch(
    `${getBase()}/v1/packages/json/?waybill=${waybill}&token=${getToken()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error(`Delhivery tracking failed (${res.status})`);
  }

  const data = await res.json();
  const shipment = data.ShipmentData?.[0]?.Shipment;

  if (!shipment) {
    throw new Error("Shipment not found");
  }

  const scans = (shipment.Scans || []).map((s: any) => ({
    status: s.ScanDetail?.Scan || "",
    location: s.ScanDetail?.ScannedLocation || "",
    timestamp: s.ScanDetail?.ScanDateTime || "",
    instructions: s.ScanDetail?.Instructions || "",
  }));

  return {
    waybill: shipment.AWB,
    currentStatus: shipment.Status?.Status || "Unknown",
    currentStatusTime: shipment.Status?.StatusDateTime || "",
    origin: shipment.Origin || "",
    destination: shipment.Destination || "",
    scans,
    estimatedDelivery: shipment.ExpectedDeliveryDate || undefined,
    delivered: shipment.Status?.Status === "Delivered",
  };
}

/* ─── Check PIN Code Serviceability ───────────────────── */

export interface PinServiceability {
  available: boolean;
  prepaidAvailable: boolean;
  codAvailable: boolean;
  city: string;
  state: string;
  district: string;
  estimatedDays?: number;
}

export async function checkPinServiceability(pin: string): Promise<PinServiceability> {
  const res = await fetch(
    `${getBase()}/c/api/pin-codes/json/?filter_codes=${pin}&token=${getToken()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error(`Delhivery PIN check failed (${res.status})`);
  }

  const data = await res.json();
  const info = data.delivery_codes?.[0]?.postal_code;

  if (!info) {
    return {
      available: false,
      prepaidAvailable: false,
      codAvailable: false,
      city: "",
      state: "",
      district: "",
    };
  }

  return {
    available: info.pre_paid === "Y" || info.cash === "Y",
    prepaidAvailable: info.pre_paid === "Y",
    codAvailable: info.cash === "Y",
    city: info.city || "",
    state: info.state_code || "",
    district: info.district || "",
    estimatedDays: info.max_days ? parseInt(info.max_days) : undefined,
  };
}
