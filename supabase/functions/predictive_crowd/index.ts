/*
  Edge function for predictive crowd analytics (mock implementation)
  Returns forecasted crowd data for tourist areas
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface CrowdPrediction {
  area_name: string
  time: string
  score: number
  prediction: string
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Mock predictive data - in a real app, this would use ML models
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const predictions: CrowdPrediction[] = [
      {
        area_name: 'India Gate',
        time: `${tomorrow.toDateString()} 6:00 PM`,
        score: 85,
        prediction: 'High congestion expected during evening hours',
        risk_level: 'HIGH'
      },
      {
        area_name: 'Connaught Place',
        time: `${tomorrow.toDateString()} 8:00 PM`,
        score: 72,
        prediction: 'Moderate crowd expected at shopping areas',
        risk_level: 'MEDIUM'
      },
      {
        area_name: 'Lotus Temple',
        time: `${tomorrow.toDateString()} 10:00 AM`,
        score: 45,
        prediction: 'Low crowd expected during morning hours',
        risk_level: 'LOW'
      },
      {
        area_name: 'Red Fort',
        time: `${tomorrow.toDateString()} 2:00 PM`,
        score: 68,
        prediction: 'Moderate tourist activity expected',
        risk_level: 'MEDIUM'
      },
      {
        area_name: 'Chandni Chowk',
        time: `${tomorrow.toDateString()} 7:00 PM`,
        score: 90,
        prediction: 'Very high congestion expected during festival season',
        risk_level: 'HIGH'
      }
    ]

    // Add some randomization to make it feel dynamic
    const randomizedPredictions = predictions.map(pred => ({
      ...pred,
      score: Math.max(20, Math.min(100, pred.score + (Math.random() - 0.5) * 20))
    }))

    return new Response(
      JSON.stringify(randomizedPredictions),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  } catch (error) {
    console.error('Error generating predictive data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate predictive analytics' }),
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