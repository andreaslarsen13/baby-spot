---
name: experiment
description: Switch to the experiment branch worktree and start its dev server on port 5174.
allowed-tools: Bash
---

# Experiment Branch

Switch context to the experiment branch and ensure its dev server is running.

## Steps

1. Change working directory to the experiment worktree: `/Users/akl/Desktop/Baby Spot/.worktrees/experiment`
2. Check if port 5174 is already in use - if so, confirm it's our dev server
3. If not running, start the dev server in the background: `npm run dev -- --port 5174`
4. Confirm the server is running and accessible at http://localhost:5174

## Output

Tell the user:
- You're now working in the experiment branch
- Dev server is running at http://localhost:5174
- Ready to make changes
