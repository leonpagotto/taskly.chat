# Taskly.chat Documentation

This folder contains all documentation for the Taskly.chat project.

## 📁 Directory Structure

### `/guides` - User & Testing Guides
Documentation for end users and testers:
- **QUICK_START_TESTING.md** - Quick testing guide
- **STORY_CREATION_USER_GUIDE.md** - How to create user stories
- **TASKS_VS_CHECKLISTS_EXPLAINED.md** - Explanation of tasks vs checklists concepts
- **TESTING_GUIDE_PERSISTENCE_NOTES.md** - Comprehensive testing guide for persistence and notes features
- **USER_GUIDE_NEW_FEATURES.md** - Guide for new features
- **VISUAL_GUIDE.md** - Visual guide to the application

### `/setup` - Setup & Configuration
Documentation for setting up and deploying the application:
- **DEPLOY_CHECKLIST.md** - Pre-deployment checklist
- **PRODUCTION_SETUP.md** - Production environment setup
- **SUPABASE_AUTH_SETUP.md** - Supabase authentication setup
- **SUPABASE_CONFIGURATION.md** - Supabase configuration guide
- **TROUBLESHOOTING.md** - General troubleshooting guide
- **USER_REGISTRATION_SETUP.md** - User registration setup

### `/development` - Active Development Docs
Current development documentation and recent fixes:
- **PERSISTENCE_FIX_SUMMARY.md** - Summary of persistence bug fixes
- **USER_STORIES_IMPLEMENTATION_COMPLETE.md** - Recently completed user stories
- **UUID_TYPE_MISMATCH_FIX.md** - UUID type mismatch database fix

### `/archive` - Historical Documentation
Archived implementation logs, completed features, and historical updates:
- Schema-related documentation (SCHEMA_*.md)
- Microsoft Calendar integration docs (MICROSOFT_*.md)
- UI update logs (UI_UPDATES_*.md, CATEGORY_ICONS_*.md, etc.)
- Feature implementation summaries
- Deployment-related historical docs
- Completed bug fix documentation

## 🚀 Getting Started

1. **New to the project?** Start with the main [README.md](../README.md) in the root directory
2. **Setting up locally?** Check `/setup/PRODUCTION_SETUP.md` and `/setup/SUPABASE_CONFIGURATION.md`
3. **Testing features?** See `/guides/QUICK_START_TESTING.md`
4. **Need help?** Check `/setup/TROUBLESHOOTING.md`

## 📝 Documentation Guidelines

- **Active documentation** should be in `/guides`, `/setup`, or `/development`
- **Completed work** should be moved to `/archive` after the feature is stable
- **Obsolete documentation** should be deleted, not archived
- Keep the main README.md updated with links to relevant docs

## 🗂️ Archive Policy

Documents are moved to `/archive` when:
- The feature is fully implemented and stable
- The documentation is historical (implementation logs, update summaries)
- The information is no longer actively referenced but may be useful for historical context

Documents are deleted when:
- They are completely obsolete
- They contain outdated/incorrect information
- They duplicate other documentation
