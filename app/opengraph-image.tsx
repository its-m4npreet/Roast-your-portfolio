import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1f2937 100%)',
          color: 'white',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Roastfolio
        </div>

        <div
          style={{
            fontSize: 78,
            lineHeight: 1.05,
            fontWeight: 800,
            maxWidth: 980,
          }}
        >
          Get Your Portfolio
          <span style={{ color: '#f97316' }}> Roasted </span>
          by AI
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            opacity: 0.9,
          }}
        >
          Roast • Recruiter • Brutal
        </div>
      </div>
    ),
    size
  );
}
