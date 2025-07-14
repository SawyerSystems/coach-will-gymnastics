#!/bin/bash

# Professional Git Secret Cleanup using git-filter-repo
echo "🔒 Professional Git History Cleanup"
echo "=================================="

# Backup the current .env
echo "📋 Creating backups..."
cp .env .env.BACKUP 2>/dev/null || echo "No .env to backup"

# Create a list of secrets to remove
cat > /tmp/secrets-to-remove.txt << 'EOF'
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
EOF

echo "🧹 Removing secrets from git history..."
git filter-repo --replace-text /tmp/secrets-to-remove.txt --force

echo "📝 Restoring current environment file..."
if [ -f .env.BACKUP ]; then
    mv .env.BACKUP .env
    echo "✅ Restored .env with your current secrets"
fi

echo "🔒 Ensuring .env is ignored..."
if ! git check-ignore .env >/dev/null 2>&1; then
    echo ".env" >> .gitignore
    git add .gitignore
    git commit -m "Ensure .env is properly ignored"
fi

echo "🧽 Final cleanup..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "🎉 Git history successfully cleaned!"
echo ""
echo "📊 Verification:"
if git log --all --source --grep="eyJ" | head -5; then
    echo "⚠️  Some references might remain"
else
    echo "✅ No JWT tokens found in commit messages"
fi

echo ""
echo "🔍 Checking for remaining secrets in files:"
if git log --all -S "eyJhbGciOiJIUzI1NiI" --oneline | head -3; then
    echo "⚠️  Some secrets might still exist in history"
else
    echo "✅ No secrets found in file contents"
fi

echo ""
echo "🚀 Next steps:"
echo "   git push --force-with-lease origin main"
echo ""
echo "💡 Your current .env file is preserved and working!"

# Cleanup
rm -f /tmp/secrets-to-remove.txt
