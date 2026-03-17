# expcli

The CLI for building Express + TypeScript projects.

Scaffold projects, generate modules, and add integrations — all from the terminal.

```bash
npx expcli-ts new my-api
```

---

## Requirements

- Node.js **18+**
- npm / yarn / pnpm / bun

---

## Installation

**Use without installing (recommended to start):**
```bash
npx expcli-ts <command>
```

**Install globally:**
```bash
npm install -g expcli-ts
```

---

## Quick Start

```bash
# Scaffold a new project
expcli new my-api

# Move into it
cd my-api

# Start dev server
npm run dev
```

---

## Commands

| Command | Description |
|---|---|
| `expcli new <name>` | Scaffold a new project |
| `expcli generate <schematic> <name>` | Generate a file |
| `expcli add <integration>` | Add an integration |
| `expcli build` | Compile with tsup |
| `expcli start` | Run compiled app |
| `expcli start-dev` | Dev server with hot reload |
| `expcli info` | Show project and system info |
| `expcli list` | List all schematics and integrations |

---

## `expcli new`

Scaffold a new Express + TypeScript project.

```bash
expcli new <name> [options]
```

| Option | Description |
|---|---|
| `-t, --template <name>` | `minimal` \| `rest-api` \| `full` |
| `-p, --package-manager <pm>` | `npm` \| `yarn` \| `pnpm` \| `bun` |
| `--skip-install` | Skip dependency installation |
| `--no-git` | Skip git initialization |
| `-d, --directory <dir>` | Custom output directory |
| `--dry-run` | Preview files without writing |

### Templates

**`minimal`** — Bare Express + TypeScript setup.
```
src/
  app.ts
  index.ts
  config/env.ts
```

**`rest-api`** — Structured API with modules, CORS, Helmet, and a health check.
```
src/
  app.ts
  index.ts
  routes.ts
  config/env.ts
  modules/
    health/
```

**`full`** — Complete setup with error handling, guards, pipes, response helpers, and a full CRUD module.
```
src/
  app.ts
  index.ts
  routes.ts
  config/env.ts
  common/
    errors/
    guards/
    middleware/
    pipes/
    response/
  modules/
    health/
    users/
```

### Examples

```bash
# Interactive (prompts for template and package manager)
expcli new my-api

# Non-interactive
expcli new my-api --template full --package-manager pnpm

# Preview without creating files
expcli new my-api --template rest-api --dry-run
```

---

## `expcli generate`

Generate individual files inside an existing project.

```bash
expcli generate <schematic> <name> [options]
# Alias
expcli g <schematic> <name>
```

| Option | Description |
|---|---|
| `--flat` | Write directly to `modulesDir`, no subfolder |
| `--path <path>` | Custom output path |
| `--dry-run` | Preview files without writing |

### Schematics

| Schematic | Alias | Output |
|---|---|---|
| `module` | `mod` | Full module: controller + service + routes + model + dto |
| `controller` | `co` | Controller class |
| `service` | `s` | Service class |
| `route` | `r` | Express router |
| `model` | `m` | TypeScript interface |
| `dto` | `d` | DTO interfaces + validators |
| `middleware` | `mw` | Express middleware |
| `guard` | `gu` | Route guard middleware |
| `exception-filter` | `ef` | Error handler (4-argument) |
| `pipe` | `p` | Body transform/validate middleware |
| `spec` | `sp` | Supertest spec file for a module |

### Examples

```bash
# Generate a full module
expcli g module posts

# Generate individual files
expcli g controller auth
expcli g service payment
expcli g middleware rate-limiter
expcli g guard admin

# Preview without writing
expcli g module comments --dry-run
```

A generated module looks like this:

```
src/modules/posts/
  posts.controller.ts
  posts.service.ts
  posts.routes.ts
  posts.types.ts
  posts.dto.ts
```

After generating a module, register its router in `src/routes.ts`:

```ts
import { postsRouter } from './modules/posts/posts.routes.js';
router.use('/posts', postsRouter);
```

---

## `expcli add`

Add an integration to your project. Installs packages, scaffolds files, and patches existing ones.

```bash
expcli add <integration> [options]
```

| Option | Description |
|---|---|
| `--force` | Reinstall even if already installed |
| `--skip-install` | Skip package installation |

### Available Integrations

**Validation**

| Integration | Packages installed |
|---|---|
| `zod` | `zod` |
| `class-validator` | `class-validator`, `class-transformer` |
| `joi` | `joi` |

**Documentation**

| Integration | Packages installed |
|---|---|
| `swagger` | `swagger-jsdoc`, `swagger-ui-express` |

Mounts API docs at `/api-docs`. Patches `src/app.ts` automatically.

**Testing**

| Integration | Packages installed |
|---|---|
| `jest` | `jest`, `ts-jest`, `@types/jest`, `supertest` |
| `vitest` | `vitest`, `@vitest/coverage-v8`, `supertest` |

**Security**

| Integration | Packages installed |
|---|---|
| `helmet` | `helmet` |
| `rate-limit` | `express-rate-limit` |

**Logging**

| Integration | Packages installed |
|---|---|
| `winston` | `winston` |
| `pino` | `pino`, `pino-http` |

**Databases**

| Integration | Packages installed |
|---|---|
| `prisma` | `@prisma/client`, `prisma` (dev) |
| `typeorm` | `typeorm`, `reflect-metadata` |
| `drizzle` | `drizzle-orm`, `drizzle-kit` (dev) |
| `mongoose` | `mongoose` |

**Auth**

| Integration | Packages installed |
|---|---|
| `jwt` | `jsonwebtoken`, `@types/jsonwebtoken` |
| `sessions` | `express-session`, `@types/express-session` |
| `passport` | `passport`, `passport-local` |

**Infrastructure**

| Integration | What it creates |
|---|---|
| `docker` | `Dockerfile`, `.dockerignore`, `docker-compose.yml` |
| `github-actions` | `.github/workflows/ci.yml` |

### Examples

```bash
expcli add zod
expcli add prisma        # prompts for database provider
expcli add swagger
expcli add jwt
expcli add docker
expcli add github-actions
```

---

## `expcli build`

Compile the project with tsup.

```bash
expcli build [options]
```

| Option | Description |
|---|---|
| `--watch` | Watch for changes and rebuild |
| `--outDir <dir>` | Override output directory |

---

## `expcli start`

Run the compiled application.

```bash
expcli start [options]
```

| Option | Description |
|---|---|
| `--entryFile <file>` | Override entry file (default: `dist/index.js`) |

> Run `expcli build` first.

---

## `expcli start-dev`

Start the app in watch mode using [tsx](https://github.com/privatenumber/tsx).

```bash
expcli start-dev [options]
```

| Option | Description |
|---|---|
| `--entryFile <file>` | Override entry file |
| `--no-clear` | Disable screen clear on restart |

---

## `expcli info`

Display system and project information.

```bash
expcli info
```

Outside a project:
```
  expcli — v0.1.0

  System
  ──────────────────────────────────
  Node.js         v20.0.0
  Platform        linux (x64)
  Package Manager npm (detected)
```

Inside a project:
```
  expcli — v0.1.0

  Project: my-api  (full template)
  ──────────────────────────────────
  Source root     src
  Entry file      src/index.ts
  Output dir      dist

  Modules (2)
    users         src/modules/users
    posts         src/modules/posts

  Integrations (3)
    ✔ zod
    ✔ prisma
    ✔ swagger
```

---

## `expcli list`

Browse all available schematics and integrations.

```bash
expcli list              # show everything
expcli list schematics   # schematics only
expcli list integrations # integrations only

# Alias
expcli ls
```

---

## `expcli.json`

Every project contains an `expcli.json` at its root. The CLI reads this file to know your project structure and tracks modules and integrations.

```json
{
  "version": "1",
  "name": "my-api",
  "template": "rest-api",
  "packageManager": "npm",
  "srcRoot": "src",
  "modulesDir": "src/modules",
  "entryFile": "src/index.ts",
  "outDir": "dist",
  "integrations": [
    { "name": "zod", "options": {} },
    { "name": "prisma", "options": { "provider": "postgresql" } }
  ],
  "modules": [
    { "name": "users", "path": "src/modules/users" },
    { "name": "posts", "path": "src/modules/posts" }
  ]
}
```

---

## License

MIT
