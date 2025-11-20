# Angarita Seguros - Development Instructions

This guide summarises the current state of the web app and the conventions we follow when extending it.

## 1. Tech stack and global conventions
- Next.js 15 (App Router) with React 19, TypeScript, and the new Server Actions architecture disabled (all API work lives under src/app/api).
- Styling is done with CSS Modules. Legacy components also use utility class names that match Tailwind vocabulary (bg-gray-50, 	ext-brand-blue, etc.). We keep that naming for readability, but any new tokens must be backed by CSS (either in the module or a shared stylesheet).
- The global font is Inter, loaded through 
ext/font. If you introduce a new font, wire it through the same mechanism.
- Key UI libraries already in use: framer-motion (micro-animations), @tanstack/react-table (data grids), 
eact-select (CreatableSelect wrapper), 
eact-dropzone (file inputs), 
echarts (dashboards), xlsx + file-saver (exports), and 
eact-icons.
- Follow React client component best practices ('use client' when hooks are required) and keep business logic inside components or dedicated hooks/utilities.

## 2. Brand and UI guardrails
### 2.1 Colour palette
| Token | Hex | Typical use |
| ---- | ---- | ---- |
| Brand Blue | #003440 | Primary headings, navbar, footer, dashboard chrome |
| Accent Orange | #FD7E14 | Call to action buttons, success badges |
| Light Background | #F8F9FA | Page backgrounds (bg-gray-50 equivalent) |
| Neutral Gray | #6C757D | Secondary text and labels |
| White | #FFFFFF | Card and panel backgrounds |

### 2.2 Typography and iconography
- Inter is the base font. Heading weights are handled through CSS modules; avoid inline font declarations.
- Icons come from 
eact-icons/fa. Reuse existing pictograms before adding new icon packs.

### 2.3 Logos and assets
- Logos and partner brands live under public/img. Preserve aspect ratios and do not recolour SVG/PNG assets.
- Keep at least 16 px of clear space around the primary logotype.

### 2.4 Motion
- Use the FadeIn component for entrance animations. Configure duration and delay via props instead of manual framer-motion calls.

## 3. Project structure highlights
- src/app/layout.tsx sets up the Inter font, the ClientLayoutWrapper, and injects the persistent navbar, footer, floating chat button, and chat panel.
- src/components/layout houses the shared layout elements and chat experience (FloatingChatButton, ChatPanel).
- src/components/home groups the home page sections (Aseguradoras, Beneficios, Testimonios, Noticias).
- src/components/ui contains reusable primitives (CotizacionSkeleton, CreatableSelect, Dropzone).
- src/components/dashboard contains each dashboard module and the modals they depend on.
- src/app/* follows the App Router directory-per-route pattern. Nested folders map to the multi-step quotation flows and dashboard sub-pages.
- src/app/api contains all mock API routes. Each file is responsible for producing deterministic fake data.

## 4. Feature overview
### 4.1 Landing page and quick quote
- src/app/page.tsx drives the quote selector. quoteTypes defines the pills (icon + label); quoteConfig defines copy, query parameter names, and the destination route per product.
- Supported keys today: vehiculo, salud, vida, soat, mascotas, cirugia (placeholder), and financiacion.
- When adding a new product, update both arrays and ensure the downstream route exists. For SOAT we reuse the vehicle confirmation route and pass 	ipo=soat in the query string.

### 4.2 Informational content
- /quienes-somos, /nuestros-seguros, /contacto, /politica-de-datos, and /terminos ship as static pages styled with CSS modules.
- /blog lists hard-coded articles; /blog/[id] renders article detail by matching the in-file posts array and uses dangerouslySetInnerHTML to inject rich text snippets. Update both arrays when adding content.

### 4.3 Quotation flows
- Standard pattern: confirmar (validate people/vehicle data), cotizar (collect extra fields and call a mock API), detalle (summaries, acquisition form).
- Current implementation status:

| Tipo | Rutas activas | Notas |
| ---- | ---- | ---- |
| Vehiculo | confirmar, cotizar, detalle, resultados (shared) | Uses /api/vehiculo/[placa] and /api/cotizar |
| Salud | confirmar, cotizar, detalle | Uses /api/persona/[documento] and /api/cotizar-salud |
| Vida | confirmar, cotizar, detalle | Uses /api/persona/[documento] and /api/cotizar-vida |
| Mascotas | confirmar, cotizar, detalle | Uses /api/persona/[documento] for the owner and /api/cotizar-mascotas for quotes |
| SOAT | Reuses flujo vehiculo | Adds 	ipo=soat in the query string to display vehicle quotes |
| Financiacion | confirmar (redirect to Sura Financia), cotizar (placeholder) | Confirmation step calls /api/persona/[documento] |
| Cirugia | cotizar (placeholder) | Confirmation and detail pages are pending |

- Detail pages expect the selected quote to be JSON-encoded in a data query parameter (encodeURIComponent(JSON.stringify(quote))). Keep this contract if you add new detail pages.

### 4.4 Dashboard
- /dashboard/page.tsx renders a single page application controlled by DashboardNavbar. activeSection toggles which module is visible.
- Available modules:
  - RequestsList: pulls /api/requests, supports filtering and Excel export through @tanstack/react-table + xlsx.
  - UsersList: manages mock team members with add/edit/delete via UserFormModal.
  - ClientList: maintains an in-memory list and offers add + detail modals.
  - TaskList: tracks reminders (general tasks, policy expirations, birthdays).
  - CollectionsList: shows receivables and lets you move items through pending/pagada/cancelada states.
  - ReportsModule: renders sample charts with 
echarts (bar and pie).
  - FilesModule: lightweight file explorer with simulated folders/files.
  - SettingsModule: toggles notification, theme, and integration flags (purely client-side).
  - CumplimientoModule: dedicated workflow for compliance policies (see section 5).
- /dashboard/cumplimiento exposes the compliance workflow directly, wrapping CumplimientoModule inside its own layout.

### 4.5 Chat assistant
- FloatingChatButton and ChatPanel appear on every page. Messages hit /api/chat, which returns canned responses based on keywords.

## 5. Mock APIs
- Entity lookups:
  - /api/persona/[documento] returns deterministic identity data (age, name, gender).
  - /api/vehiculo/[placa] returns deterministic vehicle metadata.
- Quotation engines:
  - /api/cotizar handles vehicle (and SOAT) quotes.
  - /api/cotizar-salud, /api/cotizar-vida, /api/cotizar-mascotas each return arrays tailored to their flows, applying pricing modifiers for age, smoking status, species, etc.
- Dashboard data:
  - /api/requests, /api/users return seed records for their respective modules.
  - /api/aseguradoras and /api/etiquetas keep the lookup values used by CreatableSelect.
  - /api/cumplimiento stores compliance policies in memory. POST expects a FormData payload (text fields plus optional files) and writes files to public/uploads. Because the storage is in-memory, data resets whenever the dev server restarts.
- Conversational helper:
  - /api/chat responds to POST requests with message in the body and returns a short string reply.

## 6. Reusable components and patterns
- FadeIn: wraps sections that should animate into view.
- CotizacionSkeleton: placeholder cards while quotes load.
- CreatableSelect: abstraction over 
eact-select/creatable. Pass the endpoint to apiUrl, handle onCreate with an API call that returns { id, name }.
- Dropzone: simplifies file uploads inside the compliance modal.
- Dashboard modals (AddClientModal, AddTaskModal, UserFormModal, etc.) follow a shared pattern: controlled open state, local form state, and up-propagated callbacks.

## 7. Data handling notes
- Navigation between quotation steps uses the App Router useRouter hook. Always push using query strings so mock APIs can read the relevant id/plate.
- Detail pages decode the data query parameter on mount. Always guard JSON parsing with 	ry/catch.
- CumplimientoModule reloads its table by re-fetching /api/cumplimiento after the modal closes; replicate that behaviour when adding new data-entry modals.
- File uploads land in public/uploads. Clean up unused assets before committing.
- All mock APIs include artificial latency (500-2000 ms). When adding endpoints, add a similar setTimeout so the UI loading states remain meaningful.

## 8. Extending the project
- **New insurance product**: update quoteTypes and quoteConfig, create confirmar/cotizar/detalle routes under src/app/cotizacion/<slug>/, add or extend the mock API, and wire the detail view to accept the JSON-encoded quote.
- **New dashboard module**: create the component under src/components/dashboard, add an entry to DashboardNavbar and the switch statement in DashboardPage, and provide any supporting API routes.
- **New mock API**: create a folder under src/app/api/<name> (or [param] for dynamic segments) and export GET/POST handlers returning deterministic data.
- **Translations or content updates**: textual content lives inline in the respective page components. Keep copy changes centralised so sections like Beneficios, Noticias, and Blog stay in sync.

## 9. Tooling and scripts
- NPM scripts: 
pm run dev, 
pm run build, 
pm run start, 
pm run lint.
- Linting uses eslint.config.mjs. Run 
pm run lint before delivering changes.
- There is no automated test suite yet; rely on manual QA flows (quotation journeys, dashboard modules, chat widget).
- For assets generated during development (e.g., uploads), ensure the public/uploads directory stays tidy in version control.

