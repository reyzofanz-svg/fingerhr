---
name: Lumina HR
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#b76dff'
  on-tertiary-container: '#400071'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  sidebar-width: 260px
  section-padding: 40px
  element-gap: 16px
---

## Brand & Style

The design system is engineered for the next generation of human resources management. It targets forward-thinking enterprises and tech-driven organizations that value efficiency, transparency, and a high-performance culture. The brand personality is **Futuristic, Sophisticated, and Precise**, moving away from the "soft" HR tropes into a space of data-driven intelligence.

The visual style is **Glassmorphic-Modern**, characterized by:
- **Depth through Translucency:** Using frosted glass effects to create a layered, multi-dimensional workspace.
- **High-End Utility:** Taking cues from industry leaders like Vercel and Linear, emphasizing performance through clean lines and intentional whitespace.
- **Radiant Accents:** Utilizing subtle glows and electric gradients to highlight activity and critical path actions within a deep, monochromatic environment.

## Colors

The palette is anchored in a **Deep Dark Mode** to provide a premium, focused atmosphere. Pure white is reserved for high-contrast typography and essential icons.

- **Primary (Indigo #6366f1):** Used for primary actions, progress indicators, and active states.
- **Secondary (Electric Blue #3b82f6):** Supporting color for data visualizations and secondary interactive elements.
- **Accent (Purple #a855f7):** Applied as a soft radial glow (15-20% opacity) behind key cards or active navigation items to create a sense of light.
- **Neutrals:** The base is a true black (`#0a0a0a`) for the canvas, with surface containers using a slightly lighter charcoal (`#171717`) to establish hierarchy.

## Typography

This design system utilizes **Geist** for its technical precision and humanist legibility. The typographic hierarchy relies on significant scale contrasts to guide the user's eye through dense HR data.

- **Headlines:** Feature tight letter spacing and heavy weights to feel impactful and modern.
- **Labels:** Utilize **JetBrains Mono** for metadata, status tags, and numerical data to reinforce the "engineered" aesthetic of the tool.
- **Contrast:** Large titles should always be in pure white (#FFFFFF), while secondary body text should drop to a 60-70% opacity white to maintain focus on the primary message.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 260px, while the main content area occupies the remaining width up to a 1440px maximum container.

- **Grid:** A 12-column grid is used for the main dashboard content. Gutters are kept wide (24px) to ensure the glassmorphic cards have room to "breathe" and their shadows don't overlap messy intersections.
- **Rhythm:** An 8px linear scale is used for all internal component spacing (8, 16, 24, 32, 40).
- **Responsive:** On tablet, the sidebar collapses into a narrow icon-only bar. On mobile, the layout shifts to a single column with 16px horizontal margins.

## Elevation & Depth

Depth is the defining characteristic of this design system. Instead of traditional drop shadows, we use **Tonal Translucency and Backdrop Blurs**:

- **Tier 1 (Canvas):** Base background color (#0a0a0a).
- **Tier 2 (Glass Cards):** Surfaces use `rgba(23, 23, 23, 0.7)` with a `backdrop-filter: blur(12px)`. Borders are 1px solid `rgba(255, 255, 255, 0.08)`.
- **Tier 3 (Floating Elements):** Modals and dropdowns use a higher opacity glass with a soft, expansive indigo-tinted shadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.1)`.
- **Active States:** Elements being interacted with should emit a subtle Purple/Indigo glow from the border or background to indicate life.

## Shapes

The shape language is bold and approachable, using **Large Pill-Style Roundedness** to contrast against the sharp, technical typography.

- **Base Components:** Buttons and Input fields use a 1rem (16px) radius.
- **Cards:** Main dashboard containers use a 2rem (32px) radius, creating a distinct "capsule" look for data sections.
- **Sidebar Items:** Active states use a fully rounded (pill) shape for a modern, fluid selection indicator.

## Components

### Buttons
- **Primary:** Solid Indigo gradient (from #6366f1 to #3b82f6) with a white label. On hover, add a subtle outer glow.
- **Ghost:** No background, 1px subtle white border (10% opacity). Text turns pure white on hover with a 5% white background fill.

### Sleek Sidebar
- Vertical navigation with high-contrast icons. Active items feature an Indigo vertical indicator on the left and a 5% Indigo background tint.
- The sidebar should be slightly translucent with a backdrop blur to hint at the content passing behind it.

### Minimalist Cards
- Glassmorphic finish as defined in the Elevation section.
- Content is strictly aligned to an internal 24px padding.
- Borders are visible but extremely subtle, only "catching the light" to define the shape.

### Input Fields
- Dark backgrounds (#171717) with a 1px border. 
- On focus, the border transitions to Primary Indigo and a soft 4px indigo glow is applied to the outer edge.

### Elegant Data Visualizations
- Charts should use thin lines (2px) with gradient fills beneath the lines.
- No heavy grid lines; use subtle dots or omit lines entirely for a cleaner, high-level look.
- Data points feature a "pulsing" glow effect when the user hovers over them.