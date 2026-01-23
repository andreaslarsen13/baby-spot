---
name: merge
description: Merge current branch (paper or experiment) into main.
allowed-tools: Bash, Read
---

# Merge to Main

Merge the current branch's changes into main.

## Steps

1. Confirm which branch we're on (paper or experiment) with `git branch --show-current`
2. Check for uncommitted changes with `git status`
3. If there are uncommitted changes, stage and commit them:
   - Run `git add -A`
   - Generate a commit message based on the changes
   - Commit with the message
4. Push the current branch to remote: `git push -u origin <branch>`
5. Switch to the main worktree: `cd /Users/akl/Desktop/Baby\ Spot`
6. Pull latest main: `git pull`
7. Merge the branch: `git merge <branch> --no-edit`
8. Push main: `git push`
9. Return to the original worktree

## Commit Message Format

- First line: Brief summary (50 chars or less)
- Blank line
- Body: Bullet points of what changed (if needed)
- End with: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

## Output

Tell the user:
- What was committed (if anything)
- Confirmation the branch was merged into main
- Any merge conflicts (if they occur, stop and ask user how to resolve)
