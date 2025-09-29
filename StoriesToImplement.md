Organized Backlog (authoritative checklist)
------------------------------------------

Foundation and Consistency
- [x] Align page titles and header spacing across pages (Notes, Stories, others)
- [x] Standardize empty states (circular gradient icon, correct size) across Today, Projects, Habits, Stories
- [x] FAB icon uses Material “chat”
- [x] Standardize action/button corners to a 12px radius; keep circular/pill UI where semantic (avatars, chips, day cells, toggles); use proportional radii for cards/surfaces

Stories (Enterprise)
- [x] Filters row below header (All Projects, All Categories)
- [x] View toggle with labels/icons (List: view_list, Board: view_kanban)
- [x] Filters/search panel with status + sort styled like selectors
- [x] Create/Edit Story full page with acceptance criteria (reuse checklist), estimation, linked tasks
- [x] Board drag-and-drop; keep list/board in sync
- [x] Stories sample data

Today
- [x] Mobile quick action buttons perfectly circular; match selector height
- [x] Day-empty state: remove duplicated buttons below scroller; keep actions inside the empty block
- [x] Use a single unified empty state with two CTAs (New Task, New Habit)

Habits
- [x] Filters (All Projects/Categories) size parity with Tasks
- [x] Habit card title regular weight; tighten gap above details row
- [x] Empty state icon and style consistent with nav/new habit

Tasks
- [x] Move Today/Week/Month toggle next to filters (two-line on mobile)
- [x] KPI cards: lighter backgrounds, compact layout, centered icons, icon-only colored (no square bg)
  - [x] Total icon updated to `list_alt_check`; icons centered with no square backgrounds; mobile keeps 4 KPIs per row with vertical icon/value/label stacking
- [x] Replace “Created” KPI with “To do” using not_started icon
- [x] Item cards: remove chevrons, keep collapse behavior; hover-only overflow actions; no inline title edit

Calendar
- [x] Click on date cell creates a new event prefilled with that date
- [x] Month/Week toggle styled like Tasks period toggle; Today button
- [x] Reduce month/year label size; keep one line

Modals
- [x] Ensure all modals overlay above sidebar; unify z-index
- [ ] Optimize 1–2 column layouts for mobile/desktop
- [x] Sticky footers with safe-area padding (EventModal reference)

Navigation/Sidebar
- [x] Move Stories item below Calendar and above Notes
- [x] Reduce padding and remove bold from Projects list items; align kebab to far right
- [x] Remove “New project” from sidebar; collapse/expand behavior on item clicks
- [x] On a tablet view, default the sidebar to collapsed (unless user preference saved)

Metrics & Onboarding
- [ ] Metrics overview sections for Tasks/Stories/Habits with trends
- [ ] Improve onboarding modal for mobile; enhance command help access from Today help

AI & Performance
- [ ] Configure Gemini key input and ensure prompt latency improvements; concise chat titles


Status Updates (work-in-progress log)
------------------------------------

- DONE: Stories page parity
  - Filters row placed below header (All Projects, All Categories)
  - View toggle with labels and icons (List: view_list, Board: view_kanban)
  - Filters panel button (tune) opens status + sort controls (Latest updated/created)
  - Standardized empty state (circular gradient icon, auto_stories)
- DONE: Header/title alignment fixes applied to Notes; Stories header now uses shared Header
- DONE: Habits filters sizing matched Tasks; habit card title weight regularized
- DONE: Today empty state icon uses circular gradient and correct size
- DONE: FAB icon switched to Material “chat” for consistency
- DONE: Auto-lock Category when Project selected in Task and Event modals
--
Additional updates (27 Sep 2025)

- DONE: Today quick action buttons are perfectly circular on mobile and centered; size matches selectors.
- DONE: Settings pages now have extra bottom padding so Save/Cancel buttons aren’t hidden by bottom nav.
- DONE: Projects empty state uses a circular gradient icon with white glyph.
- DONE: Habits empty state icon updated to match nav/new habit icon; circular gradient container applied.
- DONE: Calendar date cells are now clickable to create a new event prefilled with that date; clicking an existing event opens it for editing (no accidental create).
- DONE: Sidebar item order updated — Stories now sits below Calendar and above Notes.
- DONE: Calendar header polished — reduced title size to a single line; added Month/Week toggle matching Tasks style, with Today button retained; week view supports click-to-create and event editing.
- DONE: Sidebar defaults to collapsed on tablet widths (768–1023px) when no prior preference exists; user choice is persisted thereafter.
 - DONE: Today day-empty state unified into a single block with two CTAs (New Task, New Habit). Quick-action buttons hidden from the header when day is empty to avoid duplication.
 - DONE: Notes page layout updated for consistency and usability
  - Unified top header with aligned title and standard divider beneath
  - Desktop default split set to ~1/3 list and ~2/3 editor, with draggable resizer (min 240px, max 600px)
  - Desktop no-notes case shows a full-width empty state below the header (list column and resizer hidden)
  - In split view, the list column header is hidden; mobile keeps its list header and single-column flow

Notes: The remaining backlog below stays as source of truth; we’ll keep appending to this status section as items are completed.

- DONE: Modals overlay + sticky footers (28 Sep 2025)
  - Introduced a shared ModalOverlay to unify z-index above sidebar; applied to Event, NoteToTask, Category, FilePreview, and ProjectLink modals
  - Ensured backdrop click-to-dismiss where appropriate and centered desktop layout for Event modal
  - Made modal footers sticky with safe-area padding for mobile (Event/Category/NoteToTask), preventing CTA obstruction by bottom bars

- DONE: Stories editor, board DnD, sample data (28 Sep 2025)
  - StoryEditorPage provides full-page create/edit with acceptance criteria (checklist-style), estimates, and task linking
  - Kanban board supports drag-and-drop and syncs status with list view via lifted state in App
  - Sample data now includes example Stories across profiles; Dashboard CTA loads them


Stories implemented and lost from Today - implement them all:

--

lets make sure the title of all pages are aligned with same spacing, follow, habit, tasks page.

as a user I'd like to have more details of the possible commands that AI can receive by accessing an enhanced comprehensive onboarding (can be accessed from question mark on the Today page, and when onboarding to the app for the first time)

—

improve the onboarding modal for mobile

make sure habits tracking are working well

Habits > change the filters “projects and categories” size to match the Tasks page filters sizes.
Habits >Habit cards > Remove the bold style from habit card titles (should be regular)Habit cards > Reduce the vertical gap between the Habit title and the Recurrence, streak, and percentage icons
—

Fab chat trigger > change the icon to the following: <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=chat" />If user select a project related to a task or event, the category field should be disabled (selected the same project’s category)lets introduce a comprehensive  website to our project as the entry point where we explain the value of our tool and hook users to register and use it anywhere (mobile, desktop or tablet), where users can also subscribe to the app 

——Would you like me to work on any of the remaining items from our todo list, such as implementing the subscription system with payment integration or adding platform-specific download options?
* 
* 
* 


yes, then later:
Today > icon buttons (new task, new habit and new note) are not completely circled, fix it. the currently have a larger bottom padding which makes it off middle
Setting > bottom bar nav is hiding the buttons to save/cancel

___ FIY:

**hybrid monetization** model:

* **Free tier** → capped usage (limited tasks, habits, projects).
* **One-time purchase tier** → unlimited usage, but with limited/“cheap” AI support.
* **Premium subscription tier** → full unlimited usage + advanced AI features (summaries, natural language task creation, automations, etc).

Here’s how it could break down:

---

### **Free Tier**

* ✅ Create up to **X tasks/day**, **Y habits**, and **Z projects**.
* ✅ Basic reminders.
* ✅ Sync across devices (but limited).
* ❌ Limited or no AI assistance.

---

### **One-Time Payment (Lifetime Unlock, ~$20–30)**

* ✅ Unlimited tasks, habits, projects.
* ✅ Access to “lightweight” AI (e.g. rule-based suggestions, limited daily AI calls).
* ✅ No recurring fee.
* ❌ No access to advanced AI (summaries, smart automations, integrations).

---

### **Premium Subscription (~$5–10/month)**

* ✅ Unlimited everything.
* ✅ Full AI support:

  * Smart task creation from natural language.
  * Calendar + Outlook/Google sync.
  * AI summaries, progress insights.
  * Workflow automations.
* ✅ Early access to new features.
* ✅ Priority support.

---

This way:

* **Casual users** stay on Free.
* **Power users who hate subscriptions** get a one-time unlock.
* **Pro/Team users** fund sustainability through recurring revenue.

---


we can fold **Stories** into the **Enterprise model** as a premium, collaborative feature.
From what you’re hinting, *Stories* sounds like a way for teams to share progress, context, or updates in a more narrative, engaging format (like a mix of “team journal” + “project retrospective” + “weekly digest”).

Here’s how that could play out in monetization and functionality:

---

## **Enterprise Tier – Stories Feature**

### **Stories Concept**

* A **Story** is a narrative artifact that teams can create to wrap up progress, lessons, or milestones.
* Could be **auto-generated by AI** (summarizing tasks, habits, and projects) or written collaboratively by team members.
* Useful for **status updates, sprint reviews, knowledge sharing, and onboarding**.

---

### **Example Features**

* **AI-generated weekly Story**: pulls insights from team tasks, projects, and habits into a clean digest.
* **Collaborative editing**: team members can co-author Stories, comment, and tag relevant tasks/projects.
* **Shareable format**: Stories can be exported to PDF/Slack/Notion.
* **Analytics**: view engagement (who read it, who contributed).

---

### **Why Enterprise Only**

* Adds real value for teams (alignment, reporting, knowledge management).
* Differentiates from personal/pro users.
* Justifies higher pricing in the **Enterprise plan** (per-seat SaaS model).

---
Nice 👌 — you’re essentially evolving **Stories** into a **core enterprise planning unit**, similar to epics in Jira or user stories in agile tools. They:

* Bundle multiple tasks together.
* Have their own metadata (acceptance criteria, estimation, description).
* Can be tracked as "accomplishable items" just like tasks.
* Have two complementary views:

  * **List View** (backlog + all stories).
  * **Kanban Board View** (stories in workflow columns, e.g., Backlog → In Progress → Review → Done).


---

# User Story: Enterprise Stories & Kanban Board

**As an** enterprise user
**I want** to create and manage Stories that bundle multiple tasks and can be tracked with acceptance criteria, estimation, and descriptions
**So that** my team can work in a more structured, agile way and visualize progress in both a backlog list and a Kanban board

---

### Acceptance Criteria

* **Stories Creation**

  * Users can create a Story with: title, description, acceptance criteria, estimation (time or points).
  * Users can assign multiple tasks under a Story.
  * Stories themselves behave like tasks (they can be marked as accomplished).

* **List View (Backlog)**

  * All Stories appear in a backlog list view.
  * The list includes both unprioritized (backlog) and prioritized Stories (those placed on the Kanban board).
  * Stories can be filtered and sorted (by priority, estimation, status, assignee).

* **Kanban Board View**

  * Stories can be displayed in a Kanban board with configurable columns (default: Backlog, In Progress, Review, Done).
  * Users can drag & drop Stories between columns.
  * Board updates sync instantly with the list view.

* **Tasks Bundling**

  * Each Story can link to multiple tasks.
  * Completing all tasks does not auto-complete the Story — the Story must be closed explicitly.
  * Tasks retain their own status but roll up into Story progress (e.g., % completed).

* **Enterprise-Only**

  * Stories and Kanban board are only available in the **Enterprise plan**.
  * Non-enterprise users cannot create or manage Stories.

---

### Additional Notes / Technical Considerations

* Stories should be a **new object type** in the data model (separate from tasks, but linkable).
* Kanban view must support **real-time collaboration** (drag/drop updates sync live for all team members).
* Consider **permissions/roles** (e.g., only managers can create Stories, but all members can update linked tasks).
* Export/Share Stories (PDF, CSV, API) may be useful for enterprise reporting.
* Performance optimization needed for large teams (hundreds of Stories and tasks).

---



improve the user profile, add logout functionality and the upgrade subscriptionwith mock data for now——Got it 👍 Let’s translate this into a proper **user story** for implementation.

---

# User Story: Metrics Overview for Tasks, Stories, and Habits

**As a** Taskly user
**I want** to see metrics and progress trends for my tasks, stories, and habits over time
**So that** I can better understand my performance, track improvements, and identify areas where I need to focus more effort

---

### Acceptance Criteria

* Metrics are displayed on the **Tasks**, **Stories**, and **Habits** pages, with a dedicated “Overview” section.
* Users can view time-based trends (daily, weekly, monthly).
* At minimum, metrics include:

  * **Tasks**: tasks created, completed, overdue, completion rate.
  * **Stories**: stories created, completed, in-progress, average completion time.
  * **Habits**: streaks, completion rate, skipped habits, consistency score.
* Users can switch between different timeframes (e.g., last 7 days, last 30 days, all-time).
* Charts/visuals (bar chart, line chart, or donut chart) show trends instead of just numbers.
* Metrics update dynamically when new tasks, stories, or habits are added or completed.
* Edge case: if the user has no data yet, show a friendly empty state (e.g., “Start tracking your progress by creating your first task”).

---

### Additional Notes / Technical Considerations

* Consider caching or lazy-loading metric data to avoid performance issues with large datasets.
* Use the same UI design system (cards, graphs, consistent colors per object type: tasks, stories, habits).
* Backend: aggregate metrics in queries instead of fetching raw data to reduce load.
* Potential future enhancement: allow users to export or share their metrics (CSV/PDF).
* Security: metrics should only show data for the authenticated user.

---
add a padding bottom to all the setting pages to garantee the button will be displayer if user changes information (bottom nav bar is currently hiding the buttons)

---

Today > empty stat should at least show the sections (tasks, stories and habits list + notes empty) and the date scroller + action buttons and projects filter. the empty states should be inside the sections (list and notes)
—Optimize the modals overall, for mobile and desktop. beaware that sometimes it appear behind the sidebar, fix it. Optimize the 1 - 2 columns to work for both mobile and desktop.

Optimize the homepage UI, the icon sizes, alignment and more contextual (right habits icon for example)

apply this icon ad taskly logo (website): <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=preliminary" />

—
# User Story: Metrics Overview for Tasks, Stories, and Habits

**As a** Taskly user
**I want** to see metrics and progress trends for my tasks, stories, and habits over time
**So that** I can better understand my performance, track improvements, and identify areas where I need to focus more effort

---

### Acceptance Criteria

* Metrics are displayed on the **Tasks**, **Stories**, and **Habits** pages, with a dedicated “Overview” section.
* Users can view time-based trends (daily, weekly, monthly).
* At minimum, metrics include:

  * **Tasks**: tasks created, completed, overdue, completion rate.
  * **Stories**: stories created, completed, in-progress, average completion time.
  * **Habits**: streaks, completion rate, skipped habits, consistency score.
* Users can switch between different timeframes (e.g., last 7 days, last 30 days, all-time).
* Charts/visuals (bar chart, line chart, or donut chart) show trends instead of just numbers.
* Metrics update dynamically when new tasks, stories, or habits are added or completed.
* Edge case: if the user has no data yet, show a friendly empty state (e.g., “Start tracking your progress by creating your first task”).

---

### Additional Notes / Technical Considerations

* Consider caching or lazy-loading metric data to avoid performance issues with large datasets.
* Use the same UI design system (cards, graphs, consistent colors per object type: tasks, stories, habits).
* Backend: aggregate metrics in queries instead of fetching raw data to reduce load.
* Potential future enhancement: allow users to export or share their metrics (CSV/PDF).
* Security: metrics should only show data for the authenticated user.

---


As a user want to be able to add a new calendar event by clicking in the date in the calendar. So the calendar should be interactive and when I click on that specific date it it will trigger the new event in that with that date filled in already pre filled.—The story page is completely with different style. The background is wrong, the header has different high the button. News story is different from all the other buttons, new tasks, new habits and all the other ones. Also the there is like a no consistency on the icons. I see some icons like sometimes an emoji for the this like the least but then when I see the kanban which is weird icon that has been used also not not centralized. All the the icons needs to be refined and well centered and the style reviewed.—improve the story modal for mobile friendly and icons need alignment (acceptance criteria component could reuse the checklist from tasks & habits)

lets make  That all the titles in the pages they have. They are the same placements with the same padding. In the top because now they are not. I think they're the buttons are influencing. Each page has the different buttons and size and some don't have buttons so that makes it a move the titles, let's improve that. And also for the task in the sidebar menu I want to add the padding that is 1 rem (curently 0.75).—Today > lets make sure that the 3 buttons (New Task, New Event, New Habit) become icon buttons on tablet / mobile viewports—"Notes" and "Today" title is still not aligned with all the other page title. please fix it—

New Tasks and New Habits panel >  lets make sure they are sliding over the chat command inout (in case it is oppened), current the chat input is over it... fix please. Also the sheet panel ctas should be sticked to the bottom (like the "Create event" on the New event modal)—New Tasks and New Habits panel >  lets make sure they are sliding over the chat command inout (in case it is oppened), current the chat input is over it... fix please. Also the sheet panel ctas should be sticked to the bottom (like the "Create event" on the New event modal)	•	Make EventModal footer sticky with safe-area padding for exact consistency.


—

In the today's page I would like to unify the empty state that we have the no tasks and no habits. Just make one with 2 buttons add a task or add a habit so that make it it simpler.

—
Let's improve the usability of the modals for multi items habits and also for tasks with multiple items on a desktop and a mobile. I would like those to have a more vertical alignment and all the items would be listed below the category and object and the category and object would take only one row instead of being like taking a lot of vertical space. And let's also add the edit details. Icon button to the header of it.

—

Now let's improve the tasks page and make sure that we have a nice user friendly UI. So first of all let's remove the title Tasks overview and move the also that toggle today, This week, this month and all time to the top part with the projects and categories of filters and the toggle overview and the list will remove and we merge both in one. So we're gonna see the glance of total tasks completed, overdue and created in all in one row in a more compact view. And then below that we come with the list of tasks already and remove completely for now the trends charts.

—

In the today's page, when we have an empty state, let's make sure that we don't have duplicated buttons.  So let's make sure that for the empty state, we remove those three buttons New Task, New Event and New Habits from below. The day scroller and we keep those three only in the block of the Organizer day and but let's make also make sure that we keep only one icon on top of the title Organizer Day. Maybe just a check box and not like a 2 or 3 items and then for this loading sample data section. Let's move it to down below the organizer day empty state.

—

* If you want the day-empty (but not globally-empty) message to also include quick actions, I can add a compact button set there too.
* I can localize the “Organize your day” block texts and the “Load sample data” content if needed.
* If you’d like the empty-state card text and button labels localized, I can wire them to your i18n keys next.
* We can also match button gradient colors to your design tokens if you want a more neutral or monochrome look.
—


On the sidebar menu, move the Stories item to below the actually to above the notes and below the calendar.

—

Let's improve the use UI on the tasks page where we have the 4 Kpis total tasks completed, overdue and created. Let's make this interactive component that can also filter those tasks according to the whatever is clicked with the status of it and improving that means let's change also the background color to the lighter color and not the darker as it is. So we apply this. Darker color, lighter color, lighter color the background and use also icons for each ti make more user friendly > and more compact


—



On the tasks UI, let's make those components a little more compact, adding the icon and the value on the the same row. Remove the filtering label to it whenever it's selected. So we reduce the high of the that component and also make it a little more compact with less space in between the icon and the label and also the. If you look at the Icon component with the background, we should have a standard paddings with adding the same size for all the sizes. Right now the bottom looks a bit higher so fix it has to be a squared icon with round corners.
—

implement stories connection to projects and also make possible to add new tasks from a story creation. make the create/edit story a full page component since it is quite comprehensive right now


When I'm viewing a habit or a tasks with multiple items, I would like that the model is above the sidebar so the overlay hides the sidebar. Right now it's being behind and it is being hidden by the sidebar. And also I want that to remove the labels category and Project and just keep the category and the project that it is but without those labels and make those as a badges so user can clearly see that those are. Categories and projects are different from the actual tasks or habits that has to be completed.


* Apply the same z-index convention to any other modals you want guaranteed above the sidebar (e.g., Event modal) for consistency.
* Consider a shared Modal wrapper to centralize overlay styles and z-index.
* Optional: introduce a small MetaBadge component for reuse and long-name truncation consistency.



In the today's page I would like that the cards, even if they are multiple or unique list cards, they should all have the same high for the tasks and habits. So our events they should all follow the same high even if it's for a multiple items so please And then on the tasks page there are two small UI issues. First the is the four items, the total tasks completed, overdue and created. They should be cards with a lighter color background and also let's align those icons and remove the background. So keep just icons with a colored icons without those that squared backgrounds with a weird alignment.
apply the even light color to the kpi cards and align the icons to the middle of the card

—

In the tasks page, let's replace the created for A to do status, so showing the only tasks that are still open.


—


On the tasks page. Let's make sure that we have only three items on this filter for today, this week and this month. Remove the all time.


—

On the tasks page let's make sure that we have the 4 Kpis always in one row. And for mobile we've aligned these elements vertically, so the icon and the value and the label vertical align, so we make sure that we have enough horiz. Ontal space to fit four of them. The KPIS.


——

The stories page let's make sure that we have the view filters for the Kanban and the list view and the search icon that triggers all the filtering for statuses and priorities and also the last updated select. They all in the below row and not in the header of the stories. Following the same pattern we have on the Habits and the Tasks page where we have all projects and all categories, let's follow the same style and the placement for those. Than are currently in the stories. There are more filters but they should be come below there and also the style the colors.


—


On a mobile and a tasks page, let's break the Today, this weekend, month to the 2nd line and keeping only the projects and the categories in 1 row, and then this Future in a 2nd line taking the full widgets. But that's only for mobile.

—


So on the tasks move the Today, this week and this month to the top of above the our projects and our categories filters and make sure that these are only breaking two lines for mobile and for tablets and desktop they are all in the same row. So all projects, all categories filtered together with the day or week or month filter at this together. So don't.


—


So in the tasks page I want to improve the item cards, the tasks cards. So make sure that the checkbox button is the further right and then also make sure that we remove the Chevron buttons and but we keep the collapsing and uncollapsing functionality. Then let's make sure that the three dots with the edits and duplicate options appear only when I hover over and they are consistent for single and multi items tasks. Also let's make sure that we remove the inline editing for the title of the task and if the user clicks on the task if it should either uncollapse it completely so they can start checking the inter sub items internal sub items or if it's a single item it should just check it or uncheck it.


—


On a sub item of a task and habit, uh, let's make sure that the trash icon only shows uh, when the user hovers the specific uh, sub item role and we don't need to show it all the time.

—

As a user, when I'm looking at a task or a habit with multiple items by clicking once, I would like that to be uncollapsed and then when if I click directly on the checkbox of the parents aligned to the title of that main item, I would like that all these sub items get checked. So it's a kind of a check all in one click.

—

On a tablet view, I would like that the sidebar menu is collapsed by default.

—


user the following icon for representing "to do" on the tasks kpi > <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=not_started" />


—

As a user in the notes page, I would expect that the title is aligned to the other titles of all the other pages and also the column in the middle with the notes selection I want that to be. One third of the entire part and this 2/3 would be taken by the selected note. So the user would have more space to actually write the note, and that's the default. User can always resize as it's currently is.


—

Sync. The notes page has a divider in the middle. So let's add a divider down below the header of the notes page and make sure that we have that split of 1/3 for the note selection and 2/3 for the actual selected note content. That's right, not right now the default state.

—

In the Today page I would like that the New Task, New Event and New Habit buttons they have a reduced size high, so keep the same font size, but the high should match the same height as the All project selector, so that should be lower.

—

* If you prefer the mobile icon-only buttons slightly larger (e.g., 36px) while still matching the selector’s perceived height, we can switch to w-9 h-9.
* If the selector height changes in the future, we can extract a shared utility class for control sizing to keep them in sync.


—

Habits >  All projects and categories of filter need to follow the same size as we have on the tasks page. It is not supposed to be full widht both of them, but they need to follow that size and it's like there's a maximum of width on that.


—


stories empty state needs to follow the same style as the other pages (habits / tasks) the icon is currently wrong, size and style overall


—


Let's implement a standard empty state for the project's files, notes, stories, habits, and tasks where we see. Similarly to what we have on the files with the icon, the bigger icon and circle background with the lighter Gray color behind. So let's apply this style for all those pages I just mentioned.


—

Tasks > Total tasks > change the icon to: <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=list_alt_check" />


—


change the Default element size for all viewports to medium

Calendar >
* reduce the size of month/year label and make sure it is always in 1 line only
* implement the week/month view toggle

—

- can we make sure the empty state circle icon's background is actually a perfect circle (currently it is 96x102px) fix it.
- Apply the primary gradient color (same we use in buttons) on the empty state icons
- Today > "organise your day" empty state > apply same icon style we use on the empty pages (but make it 80% of the size only)

—

In the stories page, I'd like to keep the standard and same look and feel for the select selector of the filters for the latest updated, latest created. Like the sorting select. I want that to follow the same as we use on the Projects and Categories select fields. Let's follow the same style and also for the. Kanban versus list view.


--

let's add some sample data to show the app possibilites
—-

project > empty state icon is not using the gradient, only the primary solid color. fix it. apply the gradient like all the other pages empty states.

 The habits page empty state we are using the wrong icon. Let's follow the same icon that we use on the NAV bar and then new habits button and also the stories. The new starring icon button on the top right of the screen is using the wrong icon. Let's use the same as the stories on the navigation bar icon so we keep consistency.


—


Story > view toggle > 

add label "List" and "Board" and replace the icons as following:
icon for list: <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=view_list" />

icon for board: <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=view_kanban" />


—


In the calendar page where we have the toggle for us month and week, I would like to implement that in a same style that we now have the select the toggle for today, this week and this month in the tasks page. So let's follow that style and then as well as. That's the two day button in the calendar that takes the user to the Today.


—

The two day a title in the Today page is the only one that is not aligned to the rest of the titles and all the other pages. Please let's align it.

—


Let's improve the edit story or create a story model or a page. We need to have a way to go back and or close this page and go back to the where we came from and also.


—


Can you please allow make sure that we have everything set so I can put my key from Gemini's and AI will start work accordingly.


—

AI Chats is taking too long to answer. Like really long and then also when it answers it creates a title that is really weird with options. So it should create one title comprehensive and concise. Make sure that it works.

—

As a user when I'm looking at the notes as a name to state, I would like that the two columns are not showing. So only one column shows for empty state when no nodes are in the screen. And also let's remove this gap between the projects below the new project. So every project has a gap and the same happening for chats. So the chats also they are with a gap between them.

—

As a user, I would like that the calendar view would show the tasks, habits and. Stories that I have on that day. So not only the stories but everything that is on that day scheduled I can see in this calendar in the weekly or monthly view.

—

Right as I user in the calendar view, I would like that if I click in the one of the items like a habit or task, I would open that specifically to be able to add it. And only if I click on the background of a cell over a row then I open a new event modal to create a new event in that specific date. But if I click directly in one of the existing events. It should just open that viewing for that object.


—

As a user, I would like to see an improved model for stories. Not model but an improved stage where we have.

—

As a user I want to see an unified style for all the item cards in the application. So when I go to the projects when I see also the files or maybe not the file but the stories and as well as in the habits. The habits has already the good card with the right color background color. But the tasks and the tasks KP is and as well as the projects. And as well as the stories, they need to implement the right cards called background colors matching the habits, item cards background.

—

In the sidebar let's alley a stylish a bottom style to the new chat. So instead of a gradient of the solid background I would like to have it as outlined. Button is with the gradient color in the outline and also in the the font and the icon. So use the primary gradient for the icon, the text and the outline but keep as a ghost.

—

In the sidebar menu, remove the gap between the created projects and the created chats items list.


-



￼
 Then secondly I have attached an image that to follow as a reference that I want to implement the same approach for the items list. When you so we when the user hovers over we show the three dots on the right side of the item for a project and for a chat and then we show by clicking on the 3 dots we would show something similar to what you see here that is a share, rename or move to a project on or remove. From the project or then archive or exclude. So just archive is not going to have but the other. Functionality. I want to follow the similar approach.


—

The sidebar where we have the project names, let's remove the boat from them and make it similar to the other items in the sidebar. And also let's reduce the height of the projects 'cause they seem to have a bigger padding within the items and also let's align the three dots to the further right of those items like they are on the chats components. So for the chats as well, let's reduce. The height of the items to make it more compact and.

—


Sidebar > remove the "New project" from the sidebar, move the "Projects" to below the divider and apply the following rule:
 So the projects would be collapsed and uncollapsed if the user click on the projects item list twice. And if the user clicks once it just opened the projects page with the all the projects and possibility to create a new project. But if you click and then uncollapse the project item list in the sidebar menu.
  In the sidebar as well remove the bold style from the projects item names.

- DONE: Sidebar compaction and behavior tweaks (28 Sep 2025)
  - Removed “New project” action from the sidebar
  - Implemented Projects header behavior: single-click opens Projects page; double-click toggles collapse/expand of the Projects list
  - Tightened vertical spacing for project and chat items; kebabs remain right-aligned; no extra gaps between items
- DONE: Today header polished and aligned (28 Sep 2025)
  - Today page now uses the shared Header and includes a divider below, matching other pages.
  - Quick actions: icon-only on mobile/tablet; icon+label on desktop; sizes match selector height.

- DONE: Tasks KPIs and UI polish (28 Sep 2025)
  - Moved Today/Week/Month period toggle next to the filters; removed All time
  - Implemented lighter, compact KPI cards; replaced Created with To do (not_started icon)
  - Made KPIs interactive as filters; click to filter and click again to reset
  - Item cards polished: removed chevrons, kept expand on row click; hover-only kebab; disabled inline title editing
  - Persisted Tasks filters (project/category/period/status) and added an "Include undated" toggle; mobile stacks stay compact with 4 KPIs per row

- DONE: Desktop content compaction and Stories parity (28 Sep 2025)
  - Centered desktop content beneath full-width headers/bars using a max-w container:
    - Tasks, Habits, Files, Projects list, Chat (max-w-3xl), and Stories (max-w-5xl)
  - Stories: matched look-and-feel to other pages
    - Kept filters and toggle in a full-width bar, content centered below
    - View toggle has labels + correct icons (List: view_list, Board: view_kanban)
    - Search/Filters panel opens to show status chips + unified Sort dropdown
    - Empty state uses the standard circular gradient icon style
    - New Story button matches primary gradient style used elsewhere
  - Build verification completed with success (chunk-size warning only)

- DONE: Mobile/nav polish and AI onboarding (28 Sep 2025)
  - BottomNavBar: mobile hit areas are perfectly circular (w-11 h-11), icon sizes standardized
  - Sidebar (collapsed) alignment fixed; circular hit areas for header controls
  - Settings: lightweight "Connect AI" banner surfaces when VITE_API_KEY is missing; dismiss persists
  - AI chat: continues to fall back gracefully when no key is provided

- DONE: App-wide radius standardization and CTA polish (29 Sep 2025)
  - Established a 12px button radius across the app; preserved true circular/pill elements where meaningful (avatars, chips/segmented toggles, day cells, switches)
  - Updated high-visibility CTAs and action buttons to match the 12px radius:
    - Calendar: New Event, Prev/Next arrows, Today button
    - Stories: New Story CTA and Filters button
    - Projects: New Project CTAs (header and empty state)
    - Notes: Create Note CTAs (header, empty states)
    - Lists: AddTaskForm refined (container to surface radius, submit button to 12px)
    - UnifiedToolbar: Project/Category filter selects use 12px button radius
    - ProjectDetailsView: small icon actions (edit, add chat/task/note, upload) use 12px radius
    - ChatInputBar: overlay Close, Attach, Mic, and Send buttons use 12px radius (main input remains a pill)
    - Category/Event modals: footer CTAs and delete confirmations use 12px radius
  - Kept segmented period toggles and chips as rounded-full for visual affordance and consistency
  - Build/typecheck passed after changes; no regressions observed

- DONE: Sidebar New Chat ghost/outline alignment (29 Sep 2025)
  - New Chat adopts ghost style with a 2px gradient outline; gradient icon/text; shares the same left-aligned layout and full-width hit area as other nav rows
  - Ensured the icon is not an isolated click target; the entire row remains clickable

- DONE: Calendar header styling consistency (29 Sep 2025)
  - Ensured header controls adhere to the standardized radius policy
  - Month/Week segmented toggle retains pill style; Today button aligns with the 12px radius standard
