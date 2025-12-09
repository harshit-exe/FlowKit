import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get parameters from URL
    const title = searchParams.get('title') || 'FlowKit - Free n8n Workflow Templates'
    const description = searchParams.get('description') || 'Download 150+ production-ready n8n workflow templates for free'
    const type = searchParams.get('type') || 'default' // default, workflow, category, bundle

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: 'monospace',
          }}
        >
          {/* Border */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
              border: '4px solid #FF6B35',
              borderRadius: '16px',
              display: 'flex',
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 100px',
              maxWidth: '1000px',
            }}
          >
            {/* Icon/Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 40,
              }}
            >
              <svg
                width="120"
                height="120"
                viewBox="0 0 78 78"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M39.0024 22.1547C40.0961 22.3088 40.858 23.3202 40.7041 24.414L39.2057 35.058C39.3515 35.9151 39.578 36.8367 39.9149 37.5721C40.5191 38.8909 40.7153 38.6824 42.1698 39.5019C42.944 39.938 44.1691 40.3503 44.1951 40.359L44.1237 40.418L54.4245 41.8681C55.5182 42.022 56.28 43.0336 56.1262 44.1273L54.409 56.3254C54.255 57.4192 53.2435 58.1811 52.1497 58.0271L38.8241 56.1512C37.7305 55.9971 36.9685 54.9856 37.1224 53.8919L38.6696 42.9017C38.6038 42.5759 38.5233 42.2549 38.4225 41.9872C37.9282 40.6741 37.3258 39.5882 36.1253 38.7605C35.799 38.5355 35.2508 38.2701 34.7008 38.0284L23.402 36.4378C22.3082 36.2839 21.5464 35.2723 21.7003 34.1786L23.4175 21.9805C23.5715 20.8867 24.583 20.1248 25.6768 20.2788L39.0024 22.1547Z"
                  fill="url(#paint0_linear)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear"
                    x1="41.2614"
                    y1="22.4727"
                    x2="36.5651"
                    y2="55.8332"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFAC36" />
                    <stop offset="1" stopColor="#EA7201" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: 60,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 1.2,
                maxWidth: '900px',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </div>

            {/* Description */}
            {description && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  color: '#a0a0a0',
                  textAlign: 'center',
                  maxWidth: '800px',
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            )}

            {/* Brand Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 50,
                gap: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '12px 24px',
                  backgroundColor: '#FF6B35',
                  color: '#ffffff',
                  fontSize: 24,
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                FlowKit.in
              </div>
              {type !== 'default' && (
                <div
                  style={{
                    display: 'flex',
                    padding: '12px 24px',
                    border: '3px solid #FF6B35',
                    color: '#FF6B35',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {type}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
