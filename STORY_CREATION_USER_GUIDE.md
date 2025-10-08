# Quick Guide: Creating Stories from Requests

## 🎯 What's New?
When you create a story from a request, it now comes **fully populated** with all the details you need to start working immediately!

## 📝 Two Ways to Create Stories

### 1️⃣ AI-Generated Stories (Multiple)
**Best for**: Complex requests that need multiple stories

**How to use:**
1. Open a request in Requests view
2. Click **"Generate Stories with AI"** button
3. Wait a few seconds for AI to analyze
4. Done! Stories appear with everything filled in

**What you get:**
- ✅ 1-4 stories (AI decides based on complexity)
- ✅ Clear titles and descriptions
- ✅ 2-5 acceptance criteria per story
- ✅ Story point estimates (Fibonacci: 1, 2, 3, 5, 8, 13, 21)
- ✅ Time estimates (e.g., "2d", "3h")
- ✅ Task checklists automatically created and linked
- ✅ Automatically assigned to you
- ✅ Skills copied from request
- ✅ Original requester preserved

**Example:**
```
Request: "Add user authentication with OAuth"
↓
AI generates 3 stories:
1. "Implement OAuth 2.0 Login Flow" (8 points, 3d)
   - 4 acceptance criteria
   - 5 tasks in checklist
2. "Add User Session Management" (5 points, 2d)
   - 3 acceptance criteria
   - 4 tasks in checklist
3. "Create User Profile Page" (3 points, 1d)
   - 3 acceptance criteria
   - 3 tasks in checklist
```

### 2️⃣ Manual Story Creation (Single)
**Best for**: Simple requests or when you want to customize

**How to use:**
1. Open a request in Requests view
2. Click **"Create Story"** button (plus icon)
3. Review pre-filled fields in Story Editor
4. Adjust as needed
5. Save

**What you get:**
- ✅ Title from request product/problem
- ✅ Markdown description with all request details
- ✅ Initial acceptance criterion from outcome
- ✅ Story points based on priority (critical=13, high=8, medium=5, low=3)
- ✅ Automatically assigned to you
- ✅ Skills copied from request
- ✅ Existing tasks linked
- ✅ Original requester preserved
- ✅ **Story Editor opens** so you can review before saving

**Example Description Format:**
```markdown
**Problem:** Users can't log in with their social media accounts

**Desired Outcome:** Support OAuth login for Google, GitHub, and Facebook

**Value Proposition:** Increase conversion rate by 30% with one-click login

**Affected Users:** All new and existing users

**Additional Details:** Must support mobile apps and web
```

## 🎨 Story Fields Explained

### Always Populated:
- **Title**: Short, clear name for the story
- **Description**: Full context from request (Markdown formatted)
- **Assignee**: **You** (current user) - stories are assigned to you automatically
- **Requester**: Original request creator
- **Status**: Set to "Backlog" (AI) or configurable (Manual)
- **Skills**: Copied from request skills

### AI-Generated Only:
- **Acceptance Criteria**: 2-5 testable criteria
- **Story Points**: Fibonacci estimate (1, 2, 3, 5, 8, 13, 21)
- **Time Estimate**: Optional (e.g., "2d", "3h", "1w")
- **Tasks**: Auto-created checklist with 2-6 tasks

### Manual Creation:
- **Acceptance Criteria**: 1 criterion from request outcome
- **Story Points**: Based on priority level
- **Tasks**: Links existing request tasks
- **Editable**: All fields can be adjusted before saving

## 💡 Tips & Best Practices

### For AI Stories:
1. **Write detailed requests**: More context = better AI stories
2. **Use clear outcomes**: Helps AI create acceptance criteria
3. **Tag skills**: AI preserves skills for sprint planning
4. **Review generated stories**: Edit if needed after creation
5. **Break down large requests**: AI works best with focused requests

### For Manual Stories:
1. **Use Story Editor**: Review and refine before saving
2. **Add more acceptance criteria**: AI gives you one, add more if needed
3. **Adjust story points**: Change estimate if you disagree
4. **Link related tasks**: Add more tasks if needed
5. **Update description**: Markdown formatting is preserved

## 🔄 Workflow Integration

### Typical Flow:
```
1. Product Manager creates Request
   ↓
2. Team reviews Request
   ↓
3. Developer clicks "Generate Stories with AI"
   ↓
4. AI creates 2-3 stories with tasks
   ↓
5. Stories auto-assigned to Developer
   ↓
6. Developer reviews stories in Stories view
   ↓
7. Sprint Planning: Move stories to "In Progress"
   ↓
8. Developer completes tasks
   ↓
9. Mark acceptance criteria as done
   ↓
10. Move story to "Done"
```

## 🎯 Assignment Behavior

### Who gets assigned?
- **You** (current user) are automatically assigned as the **Assignee**
- Original request creator is preserved as the **Requester**
- This creates clear ownership and accountability

### Why auto-assign?
- You're creating the story = you're taking ownership
- Clear accountability from the start
- Can be reassigned later if needed
- Helps with team capacity planning

### Can I change it?
- ✅ Yes! Open the story and change assignee
- ✅ Requester is preserved for tracking
- ✅ Both fields are optional

## 📊 What Gets Linked?

### From Request to Story:
- ✅ Project and Category
- ✅ Skills
- ✅ Existing tasks (Manual flow)
- ✅ Requester information
- ✅ Priority (converted to story points)

### From Story Back:
- ❌ Not yet implemented (future enhancement)
- Coming soon: View all stories created from a request

## ⚡ Keyboard Shortcuts

### In Requests View:
- Click request → Shows details
- Click "Generate Stories with AI" → Creates multiple stories
- Click "Create Story" (plus icon) → Creates one story

### In Story Editor:
- **Cmd/Ctrl + S**: Save story
- **Esc**: Close without saving
- **Tab**: Navigate between fields

## 🚀 Advanced Features

### AI Capabilities:
- Breaks complex requests into multiple stories
- Estimates based on described complexity
- Creates realistic task breakdowns
- Follows user story format
- Generates testable acceptance criteria

### Database Integration:
- All stories saved to Supabase automatically
- Tasks and checklists persisted
- Supports offline editing (local storage fallback)
- Real-time sync when online

## 🐛 Troubleshooting

### AI not generating stories?
- Check your Gemini API key in Settings
- Ensure request has problem and outcome filled
- Try manual creation instead

### Story Editor not opening?
- Refresh the page
- Check browser console for errors
- Try creating story again

### Fields not pre-filled?
- Ensure request has data in key fields
- Check that you're logged in
- Verify request has required fields (product, problem)

### Tasks not created?
- Only AI flow creates tasks automatically
- Manual flow links existing tasks
- You can add tasks later in Story Editor

## 📚 Related Documentation
- `STORY_FROM_REQUEST_ENHANCEMENT.md` - Technical details
- `SKILLS_IN_STORIES_IMPLEMENTATION.md` - Skills integration
- `types.ts` - Story type definition
- `services/geminiService.ts` - AI generation logic

---

**Questions?** Check the full technical documentation or submit feedback through the app!
