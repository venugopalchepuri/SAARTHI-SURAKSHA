/*
  Edge function to issue verifiable credentials for tourist trips
  Input: { user_id, trip_id, kyc_digest, valid_to }
  Output: { vc, vc_hash }
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface VCRequest {
  user_id: string
  trip_id: string
  kyc_digest: string
  valid_to: string
}

interface VerifiableCredential {
  "@context": string[]
  type: string[]
  issuer: string
  issuanceDate: string
  expirationDate: string
  credentialSubject: {
    id: string
    trip_id: string
    kyc_digest: string
    safety_tier: string
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, trip_id, kyc_digest, valid_to }: VCRequest = await req.json()

    // Create verifiable credential
    const vc: VerifiableCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://saarthisuraksha.gov.in/contexts/v1"
      ],
      type: ["VerifiableCredential", "TouristTripCredential"],
      issuer: "did:web:saarthisuraksha.gov.in",
      issuanceDate: new Date().toISOString(),
      expirationDate: valid_to,
      credentialSubject: {
        id: `did:uuid:${user_id}`,
        trip_id: trip_id,
        kyc_digest: kyc_digest,
        safety_tier: "gold" // Default tier
      }
    }

    // Generate SHA-256 hash of the VC
    const vcJson = JSON.stringify(vc)
    const encoder = new TextEncoder()
    const data = encoder.encode(vcJson)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = new Uint8Array(hashBuffer)
    const vc_hash = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return new Response(
      JSON.stringify({ vc, vc_hash }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  } catch (error) {
    console.error('Error issuing VC:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to issue verifiable credential' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  }
})