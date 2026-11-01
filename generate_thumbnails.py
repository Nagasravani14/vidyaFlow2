import os

os.makedirs('frontend/public/thumbnails', exist_ok=True)

configs = [
    ('math_mock_01_intro_algebra.svg', '01', 'Introduction to Algebra', 'Language of Symbols & Unknowns', '#06B6D4', '#3B82F6', 'x + y = 10', '11:20'),
    ('math_mock_02_variables.svg', '02', 'Variables & Constants', 'Fixed vs Changing Values', '#8B5CF6', '#EC4899', 'x = ? | c = 5', '13:45'),
    ('math_mock_03_expressions.svg', '03', 'Algebraic Expressions', 'Building Blocks of Algebra', '#10B981', '#06B6D4', '3x^2 + 5x - 7', '14:10'),
    ('math_mock_04_terms_coeffs.svg', '04', 'Terms & Coefficients', 'Factors & Numerical Multipliers', '#F59E0B', '#EF4444', '7xy -> 7 * x * y', '10:30'),
    ('math_mock_05_like_unlike.svg', '05', 'Like & Unlike Terms', 'Grouping Algebraic Families', '#6366F1', '#A855F7', '4x + 3x = 7x', '09:50'),
    ('math_mock_06_addition.svg', '06', 'Addition of Expressions', 'Horizontal & Column Methods', '#0EA5E9', '#10B981', '(2x+3) + (4x-1)', '15:15'),
    ('math_mock_07_subtraction.svg', '07', 'Subtraction of Expressions', 'Sign Reversal & Additive Inverse', '#EC4899', '#F43F5E', '-(2x - 5) = -2x + 5', '16:05'),
    ('math_mock_08_intro_linear.svg', '08', 'Introduction to Linear Equations', 'The Power of Equality (LHS = RHS)', '#8B5CF6', '#06B6D4', '2x + 7 = 15', '12:35'),
    ('math_mock_09_solving_linear.svg', '09', 'Solving Linear Equations', 'Transposition & Balance Method', '#10B981', '#3B82F6', 'x = (15 - 7) / 2', '18:20'),
    ('math_mock_10_word_problems.svg', '10', 'Word Problems', 'Real-Life Applications & Modeling', '#F59E0B', '#10B981', 'Age(A) = 2 * Age(B) + 3', '21:40')
]

for filename, num, title, subtitle, col1, col2, math_art, dur in configs:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{col1}"/>
      <stop offset="100%" stop-color="{col2}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="640" height="360" fill="url(#bgGrad)"/>
  
  <!-- Subtle Grid -->
  <g opacity="0.07" stroke="#FFFFFF" stroke-width="1">
    <line x1="80" y1="0" x2="80" y2="360"/>
    <line x1="160" y1="0" x2="160" y2="360"/>
    <line x1="240" y1="0" x2="240" y2="360"/>
    <line x1="320" y1="0" x2="320" y2="360"/>
    <line x1="400" y1="0" x2="400" y2="360"/>
    <line x1="480" y1="0" x2="480" y2="360"/>
    <line x1="560" y1="0" x2="560" y2="360"/>
    <line x1="0" y1="60" x2="640" y2="60"/>
    <line x1="0" y1="120" x2="640" y2="120"/>
    <line x1="0" y1="180" x2="640" y2="180"/>
    <line x1="0" y1="240" x2="640" y2="240"/>
    <line x1="0" y1="300" x2="640" y2="300"/>
  </g>

  <!-- Glowing Radial Blobs -->
  <circle cx="520" cy="120" r="110" fill="{col1}" opacity="0.15" filter="url(#glow)"/>
  <circle cx="140" cy="260" r="90" fill="{col2}" opacity="0.12" filter="url(#glow)"/>

  <!-- Top Badges -->
  <g transform="translate(32, 28)">
    <rect width="190" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15"/>
    <circle cx="14" cy="14" r="4" fill="{col1}"/>
    <text x="26" y="18" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#E2E8F0" letter-spacing="0.5">CLASS 8 • MATHEMATICS</text>
  </g>

  <g transform="translate(440, 28)">
    <rect width="168" height="28" rx="14" fill="#F59E0B" fill-opacity="0.12" stroke="#F59E0B" stroke-opacity="0.3"/>
    <text x="16" y="18" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FBBF24">DEMO VIDEO • MOCK</text>
  </g>

  <!-- Central Math Artwork Card -->
  <g transform="translate(360, 95)">
    <rect width="248" height="165" rx="20" fill="#FFFFFF" fill-opacity="0.04" stroke="url(#accentGrad)" stroke-width="1.5" stroke-opacity="0.4"/>
    <text x="124" y="72" text-anchor="middle" font-family="ui-monospace, monospace" font-size="22" font-weight="800" fill="url(#accentGrad)">{math_art}</text>
    <rect x="34" y="105" width="180" height="32" rx="10" fill="{col1}" fill-opacity="0.12" stroke="{col1}" stroke-opacity="0.2"/>
    <text x="124" y="125" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94A3B8">TELANGANA SCERT</text>
  </g>

  <!-- Play Circle Center Overlay -->
  <g transform="translate(484, 178)">
    <circle cx="0" cy="0" r="26" fill="#000000" fill-opacity="0.7" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2"/>
    <polygon points="-5,-9 11,0 -5,9" fill="#FFFFFF"/>
  </g>

  <!-- Left Content Info -->
  <g transform="translate(36, 120)">
    <text x="0" y="0" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="{col1}" letter-spacing="1.5">SUBTOPIC {num}</text>
    <text x="0" y="38" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">{title}</text>
    <text x="0" y="68" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">{subtitle}</text>
  </g>

  <!-- Bottom Details -->
  <g transform="translate(36, 305)">
    <rect width="74" height="26" rx="8" fill="#000000" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.15"/>
    <text x="37" y="17" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#E2E8F0">⏱ {dur}</text>
  </g>
  <g transform="translate(120, 305)">
    <text x="0" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#64748B">Linear Equations in One Variable • VidyaFlow MVP</text>
  </g>
</svg>"""
    with open(f'frontend/public/thumbnails/{filename}', 'w', encoding='utf-8') as f:
        f.write(svg)

print('Generated all 10 thumbnail SVG assets in frontend/public/thumbnails/')
