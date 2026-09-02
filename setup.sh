#!/bin/bash
# =============================================================================
# NextLaunch — Project Setup Script
# =============================================================================
# Run this after creating a new repo from the template to rename all references.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh MyAwesomeApp
#
# This will replace:
#   "NextLaunch" → "MyAwesomeApp"  (display name / PascalCase)
#   "nextlaunch" → "myawesomeapp"  (package name / lowercase)
# =============================================================================

set -e

# ─── Validate input ─────────────────────────────────────────────────────────
if [ -z "$1" ]; then
  echo "❌ Please provide your project name."
  echo ""
  echo "Usage: ./setup.sh MyProjectName"
  echo ""
  echo "Examples:"
  echo "  ./setup.sh Invitame"
  echo "  ./setup.sh MyShop"
  echo "  ./setup.sh CoolSaaS"
  exit 1
fi

PROJECT_NAME="$1"
PACKAGE_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

echo ""
echo "🚀 Setting up your project..."
echo "   Display name : $PROJECT_NAME"
echo "   Package name : $PACKAGE_NAME"
echo ""

# ─── Files to rename ────────────────────────────────────────────────────────
FILES=(
  "package.json"
  "AGENTS.md"
  "README.md"
  "src/app/[locale]/layout.tsx"
  "src/lib/constants.ts"
  "src/lib/email/templates/welcome.ts"
  "src/messages/es.json"
  "src/messages/en.json"
)

# ─── Replace references ─────────────────────────────────────────────────────
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Replace PascalCase "NextLaunch" → project display name
    sed -i '' "s/NextLaunch/$PROJECT_NAME/g" "$file"
    # Replace lowercase "nextlaunch" → package name
    sed -i '' "s/nextlaunch/$PACKAGE_NAME/g" "$file"
    echo "   ✅ $file"
  else
    echo "   ⚠️  Skipped $file (not found)"
  fi
done

echo ""

# ─── Clean up setup artifacts ───────────────────────────────────────────────
echo "🧹 Cleaning up..."

# Remove this script (no longer needed)
rm -f setup.sh
echo "   ✅ Removed setup.sh"

# Remove existing git history and reinitialize (only if this is a template clone)
if [ -d ".git" ]; then
  read -p "🔄 Reset git history? (y/N): " RESET_GIT
  if [ "$RESET_GIT" = "y" ] || [ "$RESET_GIT" = "Y" ]; then
    rm -rf .git
    git init
    git add -A
    git commit -m "Initial commit from NextLaunch boilerplate"
    echo "   ✅ Git reinitialized with clean history"
  else
    echo "   ⏭️  Git history kept"
  fi
fi

echo ""
echo "✨ Done! Your project '$PROJECT_NAME' is ready."
echo ""
echo "Next steps:"
echo "  1. cp .env.example .env.local"
echo "  2. Fill in your API keys in .env.local"
echo "  3. npm install"
echo "  4. npm run db:push"
echo "  5. npm run dev"
echo ""
