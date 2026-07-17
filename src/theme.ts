/**
 * Centralized Theme Tokens for DSE Pulse
 * Deep Navy and Charcoal Trading Terminal Aesthetic
 */

export const theme = {
  colors: {
    // Backgrounds
    background: 'bg-[#0B0E14]',          // Deep dark background
    surface: 'bg-[#0D1117]',             // Standard component surface (Github-like slate)
    elevated: 'bg-[#1F242C]',            // Elevated dropdowns, active item highlights
    
    // Borders
    border: 'border-[#30363D]',          // Immersive slate border
    borderFocus: 'border-[#58A6FF]',     // Accent border on focus
    
    // Typography
    textPrimary: 'text-[#C9D1D9]',       // High-readability light gray
    textSecondary: 'text-[#8B949E]',     // Secondary info
    textMuted: 'text-[#484F58]',         // Captions and helpers
    
    // Status colors
    positive: 'text-[#238636]',          // Success green
    negative: 'text-[#DA3633]',          // Error red
    warning: 'text-[#D29922]',           // Pending/warning amber
    accent: 'text-[#58A6FF]',            // Immersive blue accent
    
    // Status background badges
    positiveBg: 'bg-[#238636]/10 text-[#238636] border-[#238636]/20',
    negativeBg: 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/20',
    warningBg: 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/20',
    accentBg: 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/20',
  },
  fonts: {
    sans: 'font-sans',
    mono: 'font-mono',
  }
};
