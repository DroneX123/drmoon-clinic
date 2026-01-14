# Directive: Build Service Menu (Luxury Accordion)

> **GOAL:** Create a "Services & Offers" section below the Hero, using a "Luxury Accordion" layout.
> **STYLE:** Dark, Minimalist, High-End Spa (Harley Street style).

## Content to Display (The Menu)

**1. INJECTABLES (Visage)**
- Botox (1 Zone) .................... 15 000 DA
- Botox (3 Zones) ................... 35 000 DA
- Comblement Lèvres (1ml) ....... 25 000 DA
- Jawline Contouring ................ Sur Devis

**2. SOINS DE PEAU (Skin Quality)**
- Skinbooster (Hydratation) ..... 20 000 DA
- Profhilo (Bio-Remodelage) ..... 35 000 DA
- Mesotherapy (Vitamine) ........ 12 000 DA

**3. SILHOUETTE & CORPS**
- Fox Eyes (Fils Tenseurs) ...... 45 000 DA
- Traitement Cellulite .............. Sur Consultation
- Amincissement (Cryo) ............ 10 000 DA / Séance

## Design Rules (The "Fancy" Look)
1. **Container:** Use a dark glass effect (`bg-slate-900/50` with `backdrop-blur-sm`).
2. **Items:** Separated by very thin, subtle borders (`border-b border-white/10`).
3. **Typography:**
   - Categories (e.g., "INJECTABLES") must be in **Serif Font (Playfair)** and **White**.
   - Prices/Items must be in **Sans Font (Lato)** and **Soft Grey (Text-slate-400)**.
4. **Icons:**
   - Use a thin `Plus` icon from Lucide on the right.
   - When clicked, it rotates 45° to become an `X`.
5. **Animation:** The menu must slide open smoothly (`transition-all duration-300`).

## Technical
- Create a new component: `src/components/ServiceAccordion.tsx`
- Use Radix UI or Headless UI for the accordion logic if needed, OR build a custom React state.
- Ensure the 'Plus' icon rotates when clicked, and the text turns Gold (text-yellow-500) when a category is active.
