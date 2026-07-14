#!/bin/bash

echo "Creating SCode Academic AI Frontend..."

mkdir -p app
mkdir -p components
mkdir -p lib
mkdir -p public

touch app/page.tsx
touch app/layout.tsx
touch app/globals.css

touch components/Header.tsx
touch components/Footer.tsx
touch components/ThemeToggle.tsx
touch components/UniversitySelector.tsx
touch components/PDFGrid.tsx
touch components/AIAssistant.tsx
touch components/Instructions.tsx
touch components/PrivacyModal.tsx
touch components/TermsModal.tsx

touch lib/github.ts
touch lib/api.ts

touch public/logo.jpg

touch .env.production

echo "Structure created successfully"
