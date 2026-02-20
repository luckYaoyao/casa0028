## CASA0028 Assessment 1 — Single-page website (London plaques)

This project implements a **single-page spatial data story** for the CASA0028
course, using the OpenPlaques London dataset.

The site is called **casa0028-react-data-vis** and is built with:

- **Vite + React (JavaScript)**
- **Tailwind CSS** (via `@tailwindcss/vite` and `styles.css` with `@import "tailwindcss"`)
- **Maps**: `react-map-gl` + `maplibre-gl` (free, no token required)
- **Charts**: `react-chartjs-2` + `chart.js`
- **CSV → GeoJSON**: `csv2geojson`

The page is a single SPA with:

- top navigation (map / charts / data table + dark‑mode toggle),
- a collapsible filter sidebar with stats and CSV demo,
- a central view that switches between an interactive **MapLibre map** (free, no token), **linked
  charts**, and a **sortable, paginated table**, and
- a footer explaining data sources, tech stack and usage.

---

## 1. Install dependencies

From the project root:

```bash
npm install
```

This installs:

- `react`, `react-dom`, `vite`, `@vitejs/plugin-react`
- `tailwindcss`, `@tailwindcss/vite`
- `react-map-gl`, `maplibre-gl`
- `react-chartjs-2`, `chart.js`
- `csv2geojson`

---

## 2. Map configuration

The map uses **MapLibre GL** (open-source fork of Mapbox GL) via `react-map-gl/maplibre`. 
**No token or account registration is required** — the project uses free Carto basemaps.

The map automatically switches between light and dark styles based on the dark mode toggle:
- **Light mode**: Carto Positron style (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`)
- **Dark mode**: Carto Dark Matter style (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`)

Both styles are provided free of charge and require no authentication.

---

## 3. Run the project

Development server:

```bash
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

Build for production:

```bash
npm run build
```

---

## 4. Deploy to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Quick Setup

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/casa0028-recommended-reads.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository **Settings** → **Pages**
   - Set **Source** to `GitHub Actions`
   - Save

3. **Wait for deployment**:
   - Go to **Actions** tab to see deployment progress
   - Your site will be available at:
     ```
     https://YOUR_USERNAME.github.io/casa0028-recommended-reads/
     ```

### Detailed Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide, troubleshooting, and submission checklist.

**Important**: Make sure your repository is set to **Public** for GitHub Pages to work.

Preview the production build:

```bash
npm run preview
```

---

## 4. Data used in this demo

- The main dataset is a **simplified subset** of the OpenPlaques London data,
  stored as GeoJSON in `src/data/open-plaques-london-2023-11-10-filtered.js`.
- It contains **Point features** with at least:
  - `latitude` / `longitude` (in `geometry.coordinates`),
  - `title`,
  - `address`,
  - `erected` (or related year fields),
  - `organisations`,
  - subject metadata (`lead_subject_*`).
- A lightweight processing layer in `src/utils/plaqueUtils.js`:
  - derives a **plaque type** (`Historical person`, `Building`, `Event`,
    `Other`);
  - parses an approximate **year of establishment**;
  - infers a **London borough** from text fields;
  - builds **summary statistics** and **chart aggregates**.

There is also a **small CSV sample** at
`src/data/sample-plaques.csv`, and a CSV → GeoJSON conversion demo powered by
`csv2geojson` in `src/utils/csvToGeojsonExample.js`. The sidebar includes a
button to run this demo and preview the resulting GeoJSON.

---

## 5. Page structure and main components

The single page is composed of:

- `App.jsx` — main layout and global state:
  - controls the active view: **map / charts / table**;
  - manages **dark mode** and **sidebar open / closed**;
  - normalises the plaque dataset and manages all filter state;
  - coordinates selection between map, charts and table.
- `Navbar.jsx` — top bar with:
  - project title and short description;
  - **view switcher** (map / charts / table);
  - **dark‑mode toggle**;
  - button to show/hide the sidebar on mobile.
- `Sidebar.jsx` — collapsible filter and context panel, containing:
  - type dropdown (`Historical person`, `Building`, `Event`, `Other`);
  - year range **dual slider**;
  - text search on title / address;
  - borough **checkbox list**;
  - reset button;
  - `StatsCards.jsx` with total counts, type breakdown and latest plaque;
  - `CsvDemo.jsx` demoing `csv2geojson`.
- `MapView.jsx` — interactive MapLibre map (free, no token):
  - uses `react-map-gl/maplibre` + `maplibre-gl`;
  - **clusters** points at small zooms, showing counts;
  - **color‑codes** plaques by derived type;
  - supports scroll‑wheel zoom and panning;
  - **hover tooltip** for quick details;
  - **click popup** plus a draggable detail panel (`PlaqueDetailModal.jsx`);
  - responds to filters and chart/table selections.
- `ChartsView.jsx` — chart dashboard:
  - `react-chartjs-2` + `chart.js`;
  - **bar chart**: plaque count by type;
  - **line chart**: plaques per year;
  - **pie chart**: share by borough;
  - **hover tooltips** and a **chart type dropdown**;
  - **PNG export button** (uses the chart canvas `toBase64Image`);
  - clicking a bar / slice / point calls back to the app, which:
    - filters the dataset to that category, and
    - switches to the map view focused on the selection.
- `DataTable.jsx` — data grid:
  - shows the currently filtered plaques with columns:
    - title, type, year, borough, address, longitude/latitude;
  - **clickable column headers** for ascending/descending sort;
  - **pagination** with selectable page sizes (10 / 20 / 50);
  - clicking a row recentres the map and opens the detail panel.
- `PlaqueDetailModal.jsx` — draggable overlay:
  - appears when a plaque is selected from the map or table;
  - shows core metadata and the full inscription where available;
  - link out to the corresponding OpenPlaques page;
  - can be **dragged** by its header to reposition it over the map.
- `Footer.jsx` — bottom info strip:
  - credits **OpenPlaques**;
  - lists the **technical stack**;
  - short hint on how filters and views work together.

Styling is handled through **Tailwind CSS utility classes**, configured via
`src/styles.css` with `@import "tailwindcss";`.

---

## 6. Interaction design and how to use the site

- **Switch views** using the pills in the top navbar (Map / Charts / Data
  table).
- Use the **sidebar filters** to constrain the analysis by:
  - plaque type;
  - year range;
  - borough subset;
  - search keywords (title / address).
- The **map**, **charts** and **table** are all reading from the same filtered
  dataset:
  - filtering in the sidebar updates all three views;
  - clicking a chart element focuses the map on that subset;
  - clicking a table row zooms to that plaque and opens the detail overlay.
- Use the **dark‑mode switch** in the navbar to toggle between light and dark
  themes. The basemap, charts and UI colours adapt together.

This structure is intended to support a **spatial narrative** about how London
commemorates its people, buildings and events through plaques, while
demonstrating the required **React + MapLibre + Chart.js + Tailwind + CSV**
pipeline for CASA0028.

