# 🚀 My Kiro Development Experience - Snoo Rush

## The Challenge: 24 Hours to Build a Game

I'll be honest - I found out about this hackathon way later than I should have. With less than a day left before the deadline, I had a choice: give up or go all-in. I chose the latter, and that's when I discovered what "vibe coding" with Kiro actually means.

## What I Built

Snoo Rush is a speedrun platformer where Reddit communities compete as teams. It has 7 fully-designed levels, parallax backgrounds, particle effects, mobile controls, team leaderboards, and a physics system with variable jump height. Not bad for ~20 hours of work, right?

The thing is - **I couldn't have built this without Kiro**. Not in this timeframe, not with this level of polish.

## How Kiro Changed My Workflow

### The Good Parts (The Really Good Parts)

**1. Agentic Mode is a Game Changer**

This is what separates Kiro from every other AI coding assistant I've tried. Instead of asking me for permission at every single step, Kiro just... builds. It reads files, makes edits, fixes issues, and keeps going. I'd describe what I wanted - "add parallax backgrounds with multiple layers" - and come back 2 minutes later to working code.

That continuous flow is *chef's kiss*. No more "should I edit this file?" "should I create this function?" Just pure building momentum.

**2. MCP Server Integration**

The Devvit MCP server integration was incredibly smooth. Searching docs, checking APIs, understanding Reddit's platform - all of this happened seamlessly within Kiro. I didn't have to tab out to browser docs constantly. This alone saved hours.

**3. Early Bug Detection**

Kiro caught several bugs I would've spent ages debugging:
- Duplicate variable declarations in TypeScript
- Mobile jump height not matching desktop (physics timing issue)
- UI elements overlapping on different screen sizes
- Level select button text overflow

It wasn't just fixing syntax errors - it was architectural improvements and UX polish.

### The Honest Feedback (What Needs Work)

**1. Cross-Platform Command Issues**

I specifically mentioned I was on Windows with PowerShell multiple times, but Kiro kept giving me Linux/Mac commands for file operations and asset management. Commands like `cp`, `rm -rf`, bash scripts, etc. I had to manually translate these to PowerShell equivalents (`Copy-Item`, `Remove-Item`, `.ps1` scripts). 

This broke the flow. Kiro needs better OS context awareness.

**2. Long Conversation Hallucinations**

After extended coding sessions (4+ hours), I noticed Kiro started making obvious errors:
- Referencing functions that didn't exist
- Suggesting fixes for problems already solved
- Repeating the same solution multiple times
- Creating circular logic in edits

I learned to start fresh conversations every few hours, but this shouldn't be necessary.

**3. Asset Loading Confusion**

Loading external assets (like parallax backgrounds) became a mess. Kiro would:
- Download files
- Suggest deleting them
- Re-download them
- Change the file structure
- Then undo it all

I eventually handled assets manually. This area needs significant improvement for game development workflows.

**4. Summary Clutter in Agentic Mode**

Every single agentic action generated a summary. After 100+ actions, my workspace was filled with "## Summary" blocks. I appreciate the transparency, but I'd love an option to disable summaries when I'm in pure vibe-coding mode. It would:
- Reduce your costs (fewer tokens)
- Keep my workspace clean
- Let me focus on outcomes, not play-by-play

## Feature Requests for Kiro Team

### 1. Model Diversity

**Claude 4.5 with thinking mode and GPT-5 (when available)**

Here's why: GPT excels at structured architecture and planning. Claude excels at actual code implementation. Right now, Kiro uses one model. What if I could:
- Use GPT for architecture decisions and planning phases
- Switch to Claude for implementation sprints
- Use high-reasoning models for debugging complex issues

Different tasks need different strengths.

### 2. Optional Summaries

Add a setting: `Agentic Mode Summaries: [Enabled | Minimal | Disabled]`

When I'm vibe coding, I don't need to see every step. I trust Kiro. Let me opt out of summaries to save tokens and reduce clutter.

### 3. Better Asset Workflow

For game development, add:
- Asset library integration (OpenGameArt, etc.)
- Smart asset optimization (auto-resize, compress)
- Asset manifest tracking (don't download the same file 5 times)

## What Kiro Taught Me

Every other AI code editor I've tried treats me like a manager directing a junior developer. I have to review every line, approve every change, break down every task into micro-steps.

**Kiro treats me like I'm pair programming with a senior developer.** I describe the vision, Kiro implements it, catches my mistakes, and keeps building. That's the difference between an AI tool and an AI teammate.

The power of fast, continuous agentic workflow is something you can't appreciate until you experience it. I went from zero to a fully-featured game in under 24 hours. Could I have done it without Kiro? Technically yes. Would I have? Absolutely not.

## If I Had More Time...

One regret: I found this hackathon too late. If I'd had a full week with Kiro, I think I could've built something truly spectacular - maybe adding:
- Real-time multiplayer races
- Level editor for communities
- Custom power-ups and mechanics
- More sophisticated team competition features

But even with less than a day, Kiro helped me build something I'm genuinely proud of.

## Bottom Line

Kiro isn't perfect (see feedback above), but it's the closest thing I've found to "AI-augmented flow state" for coding. The agentic mode, MCP integration, and continuous workflow create something special.

To the Kiro team: **Keep pushing this direction.** You're onto something big with continuous agentic coding. Just smooth out the rough edges around OS compatibility, long-session hallucinations, and give us more control over models and summaries.

Would I use Kiro for my next project? 100% yes.

---

**Built with Kiro during Reddit & Kiro: Community Games Challenge**
**October 29, 2025 - 24 hour sprint**
