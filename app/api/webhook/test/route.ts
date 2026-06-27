import { NextRequest, NextResponse } from "next/server";

/**
 * Simple webhook test endpoint
 * POST /api/webhook/test
 * 
 * Test dengan:
 * curl -X POST https://[your-app].railway.app/api/webhook/test \
 *   -H "Content-Type: application/json" \
 *   -d '{"message":"hello"}'
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  console.log("=== WEBHOOK TEST RECEIVED ===");
  console.log("Timestamp:", timestamp);
  console.log("Method:", request.method);
  console.log("URL:", request.url);
  
  try {
    // Log all headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("Headers:", JSON.stringify(headers, null, 2));
    
    // Parse body
    const body = await request.json();
    console.log("Body:", JSON.stringify(body, null, 2));
    
    // Return success
    return NextResponse.json({
      status: "ok",
      message: "Webhook test received successfully",
      timestamp,
      received: body,
    }, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("=== WEBHOOK TEST ERROR ===");
    console.error("Error:", error);
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp,
    }, {
      status: 500,
    });
  }
}

/**
 * GET /api/webhook/test
 * Simple health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook test endpoint is working",
    timestamp: new Date().toISOString(),
    endpoints: {
      test: "/api/webhook/test",
      fingerspot: "/api/webhook/fingerspot",
    },
  });
}
