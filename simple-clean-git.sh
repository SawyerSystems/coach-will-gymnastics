#!/bin/bash

# Simple Git Secret Cleanup
# This creates a new clean history without the hardcoded secrets

echo "🔒 Simple Git Secret Cleanup"
echo "============================"

# Check if there are any secrets in the current working directory
echo "🔍 Checking current working directory for secrets..."
if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --exclude-dir=.git --exclude="*.backup" . 2>/dev/null; then
    echo "❌ Found secrets in working directory files"
else
    echo "✅ No secrets found in current working directory"
fi

# Create a new branch from the clean commit
echo "🌿 Creating clean branch from last good commit..."
git checkout -b clean-history 9d18114

# Cherry-pick important commits while excluding problematic ones
echo "🍒 Cherry-picking safe commits..."

# List of commits to potentially include (excluding the ones with secrets)
commits_to_check=(
    "912872e"  # Fix booking system UI/UX issues
    "aa838ae"  # Fix booking validation and import errors
    "752264a"  # Fix booking validation: athleteId nullable, focus areas optional
    # Skip c42d1a0, d8fc93f as they contain/reference secrets
    "3398c08"  # Configure single port setup
    "39a0ebe"  # Updated dev env to use 2 ports
)

for commit in "${commits_to_check[@]}"; do
    echo "Checking commit $commit..."
    if git show "$commit" | grep -q "eyJhbGciOiJIUzI1NiI"; then
        echo "  ⚠️  Skipping $commit (contains secrets)"
    else
        echo "  ✅ Cherry-picking $commit"
        git cherry-pick "$commit" || {
            echo "  ⚠️  Cherry-pick failed for $commit, resolving..."
            git status
            echo "Manual resolution needed for this commit"
            break
        }
    fi
done

echo ""
echo "📊 Current clean branch status:"
git log --oneline -5

echo ""
echo "🎯 Next steps:"
echo "1. Manually verify the clean-history branch has all needed changes"
echo "2. Copy any missing functionality from main branch (without secrets)"
echo "3. When ready, replace main branch:"
echo "   git checkout main"
echo "   git reset --hard clean-history"
echo "   git push --force-with-lease origin main"
