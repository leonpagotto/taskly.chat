---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

* **Golden Rule 1**: Never jump straight into doing work → always check if the request maps to an existing task.
* **Golden Rule 2**: If no task exists, follow the **spec kit workflow** (spec → plan → tasks).
* **Golden Rule 3**: Before creating new specs, double-check if it’s really new, an increment, or related to an existing story.
* **Golden Rule 4**: Maintain relationships/links between tasks to avoid duplication.

---

# 🤖 Copilot Instructions

This file defines the rules that any AI agent or Copilot must follow when working in this project.

---

## 🔹 General Principles

1. **No work outside the Spec process** – everything starts with a Spec, Plan, and Tasks.
2. **Tasks = files** – each task exists as a file under its version folder and moves between Kanban status folders.
3. **Kanban board = folder structure** – never bypass it; moving a card is moving a file.

---

## 🔹 Workflow Rules

### 1. When a request is made to the Copilot:

* **Check if it matches an existing task**

	* Look in the current sprint folder or the backlog.
	* If the task exists → start/continue implementation using that task.
* **If no task exists → follow the Spec Kit workflow**:

	1. Create the **Spec** (story, rationale, acceptance criteria).
	2. Create the **Plan** (steps to deliver the spec).
	3. Generate the **Tasks** (files) from the plan.
	4. Place new tasks in `/Backlog`.

---

### 2. Implementation Rules

* Always start from an existing task file.
* When beginning → move the file from `/Backlog` → `/InProgress`.
* After coding/testing → move `/InProgress` → `/Review`.
* Once validated → move `/Review` → `/Done`.
* Update the task file content with notes, progress, and references.

---

### 3. Duplication & Relationship Rules

* Before creating a new task, always:

	* Check if it already exists in the sprint backlog or to-do list.
	* If related, link it as a **relationship task** instead of duplicating.
* Prefer extending or incrementing existing stories over starting new duplicates.

---

## 🔹 Project-Level Notes

* **Constitution + setup files** live at the project version root (not in Kanban folders).
* Only **task files** move across Kanban statuses.
* Everything must remain in sync with the repo/folder structure.

---

✅ Following these rules ensures that Copilot contributes in the same structured way as humans, keeps tasks clean, and avoids duplication.
