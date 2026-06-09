---
name: Thermal Infrastructure Monitor
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#115cb9'
  on-secondary: '#ffffff'
  secondary-container: '#659dfe'
  on-secondary-container: '#003370'
  tertiary: '#161f26'
  on-tertiary: '#ffffff'
  tertiary-container: '#2b343b'
  on-tertiary-container: '#939ca5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#acc7ff'
  on-secondary-fixed: '#001a40'
  on-secondary-fixed-variant: '#004491'
  tertiary-fixed: '#dbe4ed'
  tertiary-fixed-dim: '#bfc8d0'
  on-tertiary-fixed: '#141d23'
  on-tertiary-fixed-variant: '#3f484f'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Noto Sans KR
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Noto Sans KR
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-sm:
    fontFamily: Noto Sans KR
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans KR
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: Noto Sans KR
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  data-mono:
    fontFamily: notoSans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  gutter: 20px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the **Korea District Heating Corporation**, focusing on the critical monitoring of IoT temperature sensors within public infrastructure. The brand personality is rooted in **reliability, civic responsibility, and precision**. Because the end-users are municipal engineers and control center operators, the UI prioritizes clarity over decoration, ensuring that high-stakes data is legible at a glance.

The visual style is **Corporate / Modern**. It utilizes a structured grid, a disciplined color palette, and high-contrast status indicators. The aesthetic leans toward a functionalist approach: heavy on whitespace to reduce cognitive load during emergency scenarios, with subtle depth markers to distinguish between interactive controls and read-only data visualizations.

## Colors

The palette is anchored by **Navy (#003366)** to convey authority and institutional trust. **Corporate Blue** serves as the primary action color, while a range of **Light Grays** provides the necessary layering for complex dashboard layouts.

Data semantics are strictly enforced through the status palette:
- **Danger (#D32F2F):** Used exclusively for critical thresholds (≥ 50°C) and emergency alerts.
- **Warning (#FBC02D):** Applied to cautionary states (40-49.9°C), requiring immediate attention but not yet critical.
- **Normal (#388E3C):** Signifies safe operational levels (< 40°C).

The background uses a subtle off-white to reduce screen glare during long shifts, while borders use a cool-toned gray to maintain a crisp, professional structure.

## Typography

The design system employs **Noto Sans KR** for its exceptional legibility in both Korean and English technical contexts. The typographic hierarchy is designed to highlight "Values" and "Statuses" first.

- **Headlines:** Use semi-bold weights for dashboard titles and section headers to provide clear visual anchors.
- **Data Display:** For sensor IDs and timestamps, a medium weight is used to ensure these strings remain distinct from descriptive body text.
- **Numeric Clarity:** Large font sizes (Display) are reserved for current temperature readings to ensure they are visible from a distance in a control room setting.

## Layout & Spacing

This design system utilizes a **12-column Fixed Grid** for desktop views to maintain data density without overwhelming the user. The primary monitoring dashboard is divided into functional zones:

1.  **Sidebar/Filter Rail (3 columns):** Control inputs and legend.
2.  **Main Interactive Area (9 columns):** Map UI and primary data tables.
3.  **Lower Analytics Zone (Full width):** Time-series line charts.

**Breakpoints:**
- **Desktop (1280px+):** Full 12-column grid with 24px gutters.
- **Tablet (768px - 1279px):** Content reflows to a 2-column stack; Map moves above Data Tables.
- **Mobile (<767px):** Single column fluid layout. Spacing units scale down to `sm` (16px) for margins to maximize screen real estate for charts.

## Elevation & Depth

Visual hierarchy is established using **Tonal Layers** supplemented by **Ambient Shadows**. 

- **Level 0 (Surface):** The global background (`#F8F9FA`).
- **Level 1 (Cards):** White surfaces with a soft, diffused shadow (0px 2px 8px rgba(0,0,0,0.05)). This is used for all primary monitoring modules (Map, Table, Chart).
- **Level 2 (Overlays/Modals):** Stronger shadows (0px 8px 24px rgba(0,0,0,0.12)) to indicate temporary interaction states like sensor detail popups on the map.
- **Level 3 (Active Elements):** Focused input fields use a subtle 2px Primary Blue border to indicate focus without shifting layout.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This minimal rounding maintains a technical, "engineered" feel while preventing the UI from appearing overly aggressive or dated. 

- **Buttons & Inputs:** 4px radius for a disciplined, professional look.
- **Cards:** 8px (rounded-lg) to clearly containerize complex data sets.
- **Status Badges:** Pill-shaped (fully rounded) to differentiate them from interactive buttons, signaling that they are read-only status indicators.

## Components

### Data Tables
Tables are the backbone of the system. Use a "Zebra-stripe" layout with very subtle light-gray backgrounds on even rows. Headers must be sticky with a 2px Navy bottom border.

### Status Badges
Badges use high-contrast solid backgrounds:
- **Critical:** White text on Red.
- **Warning:** Dark Navy text on Yellow (for legibility).
- **Normal:** White text on Green.

### Map UI Elements
Map markers use a "Pin" metaphor. Active or "Danger" sensors should pulse slightly or use a larger scale to draw immediate attention. Popups on the map must include a direct link to the sensor's historical line chart.

### Charts
Line charts use a Primary Blue line with a 2px stroke. Threshold lines (Danger/Warning) must be rendered as dashed horizontal lines across the chart area at the 40°C and 50°C marks to provide immediate context for data points.

### Buttons
- **Primary:** Solid Navy background, white text.
- **Secondary:** Transparent background, Navy 1px border.
- **Tertiary/Ghost:** No background or border, Navy text (used for low-priority actions like "Download CSV").