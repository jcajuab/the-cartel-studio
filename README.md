# The Cartel Studio

A Next.js mock ERP/POS demo for The Cartel Studio.

## Requirements

Install these tools first:

- Node.js 20 or newer
- pnpm
- Docker Desktop, or Docker Engine with Docker Compose
- Git

Recommended pnpm setup:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

If Corepack is not available, install pnpm from <https://pnpm.io/installation>.

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd the-cartel-studio
pnpm install
```

### 2. Create environment file

Linux/macOS:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Default local database URL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cart
NEXT_PUBLIC_BRAND_NAME=The Cartel Studio
```

### 3. Start Postgres

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5432` using the credentials in `.env.example`.

### 4. Run migrations and seed data

```bash
pnpm db:migrate
pnpm db:seed
```

`pnpm db:seed` clears and recreates demo accounts, payment categories, products, transactions, journal entries, and inventory quantities.

### 5. Start the app

```bash
pnpm dev
```

Open <http://localhost:3000>.

## Daily Commands

```bash
pnpm dev          # Start the local Next.js dev server
pnpm lint         # Run Biome checks
pnpm build        # Create a production build
pnpm start        # Start the production server after pnpm build
pnpm db:generate  # Generate Drizzle migrations after schema changes
pnpm db:migrate   # Apply Drizzle migrations
pnpm db:seed      # Reset and seed demo data
```

## Platform Notes

### Windows

- Use PowerShell, Windows Terminal, or WSL.
- Docker Desktop must be running before `docker compose up -d`.
- If scripts cannot find `pnpm`, run `corepack enable` in a new terminal.

### macOS

- Docker Desktop must be running before `docker compose up -d`.
- If using Homebrew, install tools with:

```bash
brew install node git
corepack enable
```

### Linux

- Install Docker Engine and the Docker Compose plugin for your distro.
- Add your user to the `docker` group if you do not want to use `sudo`.
- If Docker requires sudo, use:

```bash
sudo docker compose up -d
```

## Reset Local Data

To reset only the demo data:

```bash
pnpm db:seed
```

To remove the local Postgres volume and start from scratch:

```bash
docker compose down -v
docker compose up -d
pnpm db:migrate
pnpm db:seed
```

## Troubleshooting

If the app cannot connect to the database, confirm Postgres is running:

```bash
docker compose ps
```

If port `5432` is already in use, stop the other Postgres service or update `compose.yaml` and `.env.local` to use a different port.

If dependencies behave oddly, reinstall:

```bash
rm -rf node_modules .next
pnpm install
```

Windows PowerShell equivalent:

```powershell
Remove-Item -Recurse -Force node_modules, .next
pnpm install
```
