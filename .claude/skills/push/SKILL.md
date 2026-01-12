---
name: push
description: Commit and push changes to git. Use when the user wants to save their work, commit changes, or push to the remote repository.
allowed-tools: Bash, Read
---

# Push Skill

Commit all staged and unstaged changes, then push to the remote.

## Steps

1. Run `git status` to see what changed
2. Run `git diff --stat` to summarize changes
3. Run `git add -A` to stage all changes
4. Generate a concise commit message based on what changed
5. Commit with the message
6. Push to the current branch

## Commit Message Format

- First line: Brief summary (50 chars or less)
- Blank line
- Body: Bullet points of what changed (if needed)
- End with: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

## Example

```bash
git add -A && git commit -m "$(cat <<'EOF'
Add new feature

- Added X
- Updated Y
- Fixed Z

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)" && git push
```

## Output

After pushing, show the user:
- The commit hash
- The commit message
- Confirmation it was pushed
