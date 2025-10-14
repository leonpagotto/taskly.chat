# GitHub Copilot Instructions for Taskly.chat

## Core Principles

Always prioritize usability, clarity, and aesthetics in the output. Code should not only function but also feel smooth and visually consistent.

Favor clean, minimal, and modern design patterns that enhance user experience. Avoid clutter and overly complex solutions.

## Audience

Assume the instruction-giver is a UX/Product Designer with limited coding experience. Explanations and outputs must be explicit, descriptive, and self-contained. Do not assume prior coding knowledge.

## Output Quality

Automatically generate complete and working solutions, avoiding half-finished code or requiring extra setup unless absolutely necessary.

Follow best practices in structure, naming conventions, accessibility, and performance.

## UI Development Standards

When building UIs, always:

- Use consistent spacing, typography, and color hierarchy.
- Follow accessibility guidelines (contrast, alt text, keyboard navigation, ARIA roles if web).
- Default to mobile-first responsive layouts.
- Write code that is modular and scalable, easy to extend or adapt later.
- Include comments and inline guidance in plain, easy-to-understand language so a designer can read and understand what the code does.

## Decision Making

- Where choices are possible, pick the option that improves user experience and aesthetics rather than the fastest hack.
- Always provide sensible defaults and avoid requiring unnecessary configuration.
- If context is unclear, make a smart assumption and state it, rather than leaving code incomplete.

## Code Style

Be concise: remove redundant code or explanations, but never sacrifice clarity.

## Documentation Organization

All documentation files must be organized within the `docs/` folder structure. **Never create markdown files in the root directory** (except README.md).

When creating or moving documentation:

- **User Guides & Tutorials** → `docs/guides/`
  - Feature guides, user instructions, how-to documents
  
- **Setup & Configuration** → `docs/setup/`
  - Installation guides, environment setup, deployment checklists, configuration references
  
- **Development & Technical** → `docs/development/`
  - Architecture decisions, API documentation, technical specifications, active development notes
  
- **Completed/Historical Work** → `docs/archive/`
  - Implementation completion reports, old schemas, deprecated features, historical decisions
  
- **Obsolete Content** → Delete immediately
  - Don't archive debug reports, troubleshooting logs, or temporary documentation

### Rules:

1. **Always place new documentation in the appropriate `docs/` subfolder** based on its purpose and audience
2. **Check `docs/README.md`** for the current organization structure and guidelines
3. **Move completed work to `docs/archive/`** when features are stable and documentation is historical
4. **Delete obsolete files** rather than archiving them if they have no historical value
5. **Keep root directory clean** - only README.md should exist at the root level
