#!/usr/bin/env python3
"""Bootstrap local environment files for next-bun-starter.

Copies the committed templates into the working env files and then validates
that the required secrets are filled in:

  - .env.development -> .env
  - env.local.example -> .env.local   (only if .env.local does not exist)

After copying, it reports which required keys are still blank so you know what
to fill in. Exits non-zero if any required key is missing, making it safe to use
in `&&` chains or CI gates.

Usage:
  python3 scripts/setup_env.py [--force]

  --force   Overwrite an existing .env (never overwrites .env.local).
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

# Project root is the parent of the directory holding this script (scripts/).
ROOT = Path(__file__).resolve().parent.parent

# Required keys per file, with a hint pointing at where to get the value.
# Derived from the runtime `throw`s in app/layout.tsx, prisma/index.ts, and
# app/api/webhooks/user-create/route.ts.
REQUIRED = {
    ".env": {
        "DATABASE_URL": "Postgres connection string (run `bun run pg:start` for local)",
    },
    ".env.local": {
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "Clerk -> https://dashboard.clerk.com",
        "CLERK_SECRET_KEY": "Clerk -> https://dashboard.clerk.com",
        "WEBHOOK_SECRET": "Clerk webhook signing secret -> https://dashboard.clerk.com",
    },
}

# Optional keys: reported as info, never cause a failure.
OPTIONAL = {
    ".env": {
        "NEXT_PUBLIC_BASE_URL": "App base URL (defaults to http://localhost:3000)",
        "SENTRY_DSN": "Sentry -> https://sentry.io",
        "SENTRY_ORG": "Sentry org slug",
        "SENTRY_PROJECT": "Sentry project slug",
    },
    ".env.local": {
        "NEXT_PUBLIC_BASE_URL": "App base URL (defaults to http://localhost:3000)",
    },
}

GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"


def parse_env(path: Path) -> dict[str, str]:
    """Parse a dotenv file into a KEY -> VALUE dict.

    Skips blank lines and `#` comments, splits on the first `=`, and strips a
    single layer of surrounding single/double quotes from the value.
    """
    result: dict[str, str] = {}
    if not path.exists():
        return result
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        result[key] = value
    return result


def copy_env(force: bool) -> bool:
    """Copy templates into working env files. Returns False on fatal error."""
    source = ROOT / ".env.development"
    if not source.exists():
        print(f"{RED}Error: .env.development not found at {source}{RESET}")
        return False

    dest = ROOT / ".env"
    if dest.exists() and not force:
        print(f"{DIM}.env already exists — skipping (use --force to overwrite).{RESET}")
    else:
        shutil.copyfile(source, dest)
        action = "Overwrote" if dest.exists() and force else "Created"
        print(f"{GREEN}{action} .env from .env.development.{RESET}")

    local_source = ROOT / "env.local.example"
    local_dest = ROOT / ".env.local"
    if local_dest.exists():
        print(f"{DIM}.env.local already exists — leaving it untouched.{RESET}")
    elif local_source.exists():
        shutil.copyfile(local_source, local_dest)
        print(f"{GREEN}Created .env.local from env.local.example.{RESET}")
    else:
        print(f"{YELLOW}Warning: env.local.example not found — could not create .env.local.{RESET}")

    return True


def validate() -> bool:
    """Validate required keys across env files. Returns True if all present."""
    print(f"\n{BOLD}Validating environment files…{RESET}")
    missing_required = False

    for filename, required_keys in REQUIRED.items():
        path = ROOT / filename
        values = parse_env(path)
        print(f"\n{BOLD}{filename}{RESET}")
        if not path.exists():
            print(f"  {RED}✗ file missing{RESET}")
            missing_required = True
            continue

        for key, hint in required_keys.items():
            if values.get(key):
                print(f"  {GREEN}✓ {key}{RESET}")
            else:
                print(f"  {RED}✗ {key}{RESET} {DIM}— {hint}{RESET}")
                missing_required = True

        for key, hint in OPTIONAL.get(filename, {}).items():
            if values.get(key):
                print(f"  {GREEN}✓ {key}{RESET} {DIM}(optional){RESET}")
            else:
                print(f"  {YELLOW}• {key}{RESET} {DIM}unset (optional) — {hint}{RESET}")

    print()
    if missing_required:
        print(f"{RED}Some required keys are still blank. Fill them in, then re-run.{RESET}")
    else:
        print(f"{GREEN}All required environment variables are set. You're good to go!{RESET}")
    return not missing_required


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Copy and validate local environment files for next-bun-starter."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite an existing .env (never overwrites .env.local).",
    )
    args = parser.parse_args()

    if not copy_env(args.force):
        return 1

    return 0 if validate() else 1


if __name__ == "__main__":
    sys.exit(main())
