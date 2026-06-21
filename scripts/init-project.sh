#!/bin/bash
set -euo pipefail

read -rp "Project display name [My App]: " DISPLAY_NAME
DISPLAY_NAME="${DISPLAY_NAME:-My App}"

read -rp "Package/repo slug (kebab-case) [my-app]: " SLUG
SLUG="${SLUG:-my-app}"

read -rp "Postgres database name [myapp]: " DB_NAME
DB_NAME="${DB_NAME:-myapp}"

DB_SLUG="${SLUG//-/_}"

replace_in_file() {
	local file="$1"
	if [ -f "$file" ]; then
		sed -i "s/My App/${DISPLAY_NAME}/g" "$file"
		sed -i "s/my-app/${SLUG}/g" "$file"
		sed -i "s/myapp/${DB_NAME}/g" "$file"
	fi
}

replace_in_file package.json
replace_in_file compose.local.yml
replace_in_file .env.development
replace_in_file .env.example
replace_in_file app/layout.tsx
replace_in_file app/page.tsx
replace_in_file app/components/Logo.tsx
replace_in_file README.md

cat <<EOF

Done. Renamed to: ${DISPLAY_NAME} (${SLUG})

Next steps:
  1. bun install
  2. Copy env.local.example → .env.local and add Clerk keys
  3. Create a Clerk app: https://dashboard.clerk.com
  4. Add webhook endpoint: /api/webhooks/user-create (events: user.created, user.updated, user.deleted)
  5. bun run pg:start && bun run db:migrate:dev
  6. bun run dev

Optional CI/deploy:
  - GitHub secrets: CLERK_SECRET_KEY_TEST, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST, CYPRESS_CLERK_TEST_PASSWORD
  - Vercel: VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN
  - Neon previews: NEON_PROJECT_ID, NEON_API_KEY
  - Sentry: SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT

Enable "Template repository" in GitHub repo Settings if publishing as a template.

EOF
