---
name: copywrite
description: Rewrite copy in Spot's voice using the fine-tuned voice model. Use when the user wants to edit, improve, or rewrite marketing copy, push notifications, onboarding text, empty states, error messages, or any UI copy for Spot.
allowed-tools: Bash, Read
---

# CopyWrite Skill

This skill runs input copy through Spot's fine-tuned voice model and returns 3 variations.

## When to Use

Use this skill when the user:
- Asks to rewrite or edit copy
- Wants copy in "Spot's voice"
- Needs push notification text
- Needs onboarding copy
- Needs empty state messages
- Needs error messages
- Wants multiple options to choose from

## How to Run

Run the copywrite script with the user's input:

```bash
cd "/Users/akl/Desktop/Baby Spot" && source .venv/bin/activate && python scripts/copywrite.py "THE INPUT COPY HERE"
```

Replace `THE INPUT COPY HERE` with the actual copy the user wants rewritten.

## Output

After running the script, format a clear response for the user like this:

---

**Input:** "[the original copy]"

**Options:**

1. [first variation]

2. [second variation]

3. [third variation]

---

Then ask which they prefer or if they want more options.

## Spot Context

What Spot is:
Spot is an iOS app that books hard-to-get tables in NYC. Tell Spot where you want to eat and when, and Spot handles the rest — whether the restaurant is on Resy, OpenTable, or only takes reservations over the phone. When a table becomes available, Spot immediately books it for you.

iOS Push Notification format:
- Title: Short, 2-4 words
- Body: One sentence with details

Voice rules:
- Use "Spot" as the agent, not "we" or "us"
- No superlatives (never "best", "top", "amazing", "unique")
- Specificity over vagueness — say exactly what happens
- Active voice, confident verbs
- Utility over warmth — helping, not hand-holding
- Short, declarative sentences

Avoid: "curated", "discover", "explore", "unique", "experience", passive voice, meditation-app warmth
