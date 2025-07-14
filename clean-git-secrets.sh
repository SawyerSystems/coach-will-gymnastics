#!/bin/bash

# Clean Git Secrets Script
# This script removes sensitive data from git history while preserving current working state

echo "🔒 Git Secret Cleanup Tool"
echo "=========================="

# Backup current .env file
echo "📋 Backing up current .env file..."
cp .env .env.backup 2>/dev/null || echo "No .env file to backup"

# Create list of patterns to remove from git history
echo "🔍 Creating filter patterns..."
cat > /tmp/git-secrets-filter.txt << 'EOF'
# JWT tokens (Supabase service role keys)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZGd0ZHpyY3lmbWlzbGlsdWN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTYxMzgyOSwiZXhwIjoyMDY3MTg5ODI5fQ\.pCOdtCB4DTd7fIV5WqWFQ4TPAX3yj5Wi-ml5WGQH9sI
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZGd0ZHpyY3lmbWlzbGlsdWN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTYxMzgyOSwiZXhwIjoyMDY3MTg5ODI5fQ\.uHdGx7KZvCvE1PVq_bGTc_52qIvCNRQNO3FfkZJzfqo

# Anon keys
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZGd0ZHpyY3lmbWlzbGlsdWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTM4MjksImV4cCI6MjA2NzE4OTgyOX0\.STYHdYfsZkmPFhjeK1_uX0yQI6SMdxc6ch-uRVIA5SQ

# Other potential service keys
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoYWZ1emtocWZjcm5tcndrY2J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDA0MjY0MCwiZXhwIjoyMDM1NjE4NjQwfQ\.Zu5z3qUiRRlQQM37HU_nJ9IUGg_W5aejcmJFmME3l6A
EOF

echo "🧹 Step 1: Remove hardcoded secrets from all history..."
# Use git filter-branch to remove the secret patterns
git filter-branch --tree-filter '
    for file in $(find . -type f -name "*.js" -o -name "*.ts" -o -name "*.env*" 2>/dev/null); do
        if [ -f "$file" ]; then
            # Replace JWT patterns with placeholder
            sed -i.bak "s/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^\"]*\.[^\"]*/<REMOVED_SECRET>/g" "$file" 2>/dev/null || true
            # Remove .bak files
            rm -f "$file.bak" 2>/dev/null || true
        fi
    done
' --all

echo "🗑️  Step 2: Clean up filter-branch backup..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "📝 Step 3: Restore current working .env file..."
if [ -f .env.backup ]; then
    mv .env.backup .env
    echo "✅ Restored .env file with current secrets"
else
    echo "ℹ️  No .env backup to restore"
fi

echo "🔒 Step 4: Ensure .env is properly ignored..."
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo ".env" >> .gitignore
    echo "✅ Added .env to .gitignore"
else
    echo "✅ .env already in .gitignore"
fi

echo "📊 Step 5: Verify cleanup..."
echo "Checking for remaining secrets in git history:"
if git log --all --grep="eyJ" --oneline | head -5; then
    echo "⚠️  Some references might still exist in commit messages"
else
    echo "✅ No secret references in commit messages"
fi

echo ""
echo "🎉 Git history cleanup complete!"
echo "📋 Summary:"
echo "   - Removed hardcoded secrets from all git history"
echo "   - Preserved current working .env file"
echo "   - Ensured .env is properly ignored"
echo ""
echo "⚠️  IMPORTANT: To update remote repository, you'll need to force push:"
echo "   git push --force-with-lease origin main"
echo ""
echo "💡 Note: Team members will need to re-clone the repository after force push"

# Cleanup temp files
rm -f /tmp/git-secrets-filter.txt
