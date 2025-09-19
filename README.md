# Taskly.chat â Product Description

Taskly.chat is an **AI-powered personal assistant** that blends conversation, memory, and automation into a single experience. Unlike traditional productivity tools or project managers, Taskly.chat is designed to work the way people naturally think and talk â through **conversation**.

It acts as a **companion for life and work**, turning fleeting thoughts, reminders, and goals into structured actions without forcing rigid workflows.

---

## ð Core Identity

* **Vision**: To be the central hub of life where every idea, task, and goal â personal or professional â comes together seamlessly. Taskly.chat empowers people to live fully, act decisively, and achieve balance, making productivity effortless and meaningful.

* **Mission**: Taskly.chat helps people capture, structure, and accomplish everything that matters by blending intelligent assistance, persistent memory, and a human-like conversational experience.

---

## ð Key Features

### 1. Conversation-Centric

* Everything starts with natural chat.
* Users donât need to think in âtasksâ or âticketsâ â Taskly.chat captures the intent and organizes it automatically.
* Conversation history is preserved within **projects or threads**, allowing continuity over time.

### 2. Personal Memory

* Taskly.chat remembers what matters: preferences, routines, priorities, important dates.
* This context carries across all future conversations, ensuring that the assistant feels continuous and personalized.
* Memory can be updated, forgotten, or adjusted by the user at any time.

### 3. Instructions & Guidance

* Users can set **persistent instructions** (like tone of voice, goals, or priorities).
* These instructions guide every future output, ensuring consistency across tasks, reminders, and conversations.
* Instructions can apply globally or per âproject space.â

### 4. Smart Automations

* Context-aware reminders, nudges, and insights.
* Ability to track progress, habits, or important events without manual setup.
* Integrations with calendars, email, or third-party apps to surface the right information at the right time.

### 5. Balance Between Life & Work

* Unlike project-only tools, Taskly.chat is designed to handle **both personal and professional contexts**.
* A single space for work planning, personal reminders, creative brainstorming, and daily check-ins.

### 6. Collaboration (Optional)

* Users can **share projects or threads** with others.
* Shared instructions ensure AI-generated output remains consistent across collaborators.
* Conversations within shared spaces become structured, making teamwork smooth without extra overhead.

---

## ð Differentiators

* **Conversation-first design**: Users chat as they would with a person; the AI does the structuring.
* **Persistent memory**: Unlike chatbots that forget context, Taskly.chat builds a continuous relationship with the user.
* **Instruction-driven behavior**: AI adapts to the userâs style, not the other way around.
* **Personal + Professional scope**: Supports every aspect of life, not just âwork tasks.â
* **Human + AI collaboration**: Makes it possible for teams to align on context and let AI assist them together.
* **Seamless continuity**: Versioning and context management prevent repetition and loss of important details.

---

## ð§­ Example Use Cases

* **Personal Life**:

  * âRemind me to call Mom every Sunday.â
  * âTrack my workouts this month.â
  * âPlan a birthday dinner for Anna.â

* **Work & Productivity**:

  * âDraft a user story from todayâs meeting notes.â
  * âSummarize this long conversation into next steps.â
  * âHelp me prepare talking points for tomorrowâs presentation.â

* **Creative & Strategic Thinking**:

  * âBrainstorm album concepts with darker energy.â
  * âHelp me outline a workshop agenda for leadership.â
  * âTurn this idea into a structured plan.â

---

## ð¯ Goal

Taskly.chat is not just another project manager. Itâs a **personal AI assistant** that remembers, adapts, and acts as a **bridge between free-form conversation and structured execution** â making productivity feel natural, human, and effortless.



## 🚀 Workflow

This project uses a **Spec-driven workflow**:

* All work starts from a **Spec → Plan → Tasks**.
* Tasks are stored as files inside project version folders.
* Progress is tracked using a **Kanban board**, which is a visualization of the folder structure under `docs/tasks/` (`Backlog/`, `InProgress/`, `Review/`, `Done/`).

### 🔹 For Humans

* Always work from existing task files.
* Move tasks between status folders as you progress.
* Commit changes regularly so the Kanban board stays in sync.

### 🔹 For AI / Copilot

The Copilot follows strict rules for creating, managing, and implementing tasks.
👉 Canonical instructions: `.github/instructions/COPILOT.instruction.md`
👉 Spec Index: `docs/specs/SPEC-INDEX.md`
_______
