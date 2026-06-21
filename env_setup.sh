#!/bin/bash
set -euo pipefail

if [ ! -f .env.development ]; then
	echo "Error: .env.development not found"
	exit 1
fi

cp .env.development .env

if [ -f env.local.example ] && [ ! -f .env.local ]; then
	cp env.local.example .env.local
	echo "Created .env.local from env.local.example — fill in your Clerk keys."
fi

echo "Environment files ready. Edit .env.local with your Clerk credentials."
