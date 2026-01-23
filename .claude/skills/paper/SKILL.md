---
name: paper
description: Switch to the paper branch worktree and start its dev server on port 5173.
allowed-tools: Bash
---

# Paper Branch

Switch context to the paper branch and ensure its dev server is running.

## Steps

1. Change working directory to the paper worktree: `/Users/akl/Desktop/Baby Spot/.worktrees/paper`
2. Check if port 5173 is already in use - if so, confirm it's our dev server
3. If not running, start the dev server in the background: `npm run dev -- --port 5173`
4. Confirm the server is running and accessible at http://localhost:5173

## Output

Tell the user:
- You're now working in the paper branch
- Dev server is running at http://localhost:5173
- Ready to make changes
