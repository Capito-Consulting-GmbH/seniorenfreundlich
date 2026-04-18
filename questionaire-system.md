# Assessment / Questionnaire System

## Overview

The certificate ("Siegel") is awarded based on a configurable assessment. The assessment is a questionnaire consisting of **sections** and **questions**. Admins define the questionnaire structure via the admin panel; customers fill it out in a guided wizard on their dashboard.

The questionnaire definition is stored **in the database as versioned JSONB**, not in code. This means:
- Admins can change the questionnaire at any time without a deployment
- Old submissions stay pinned to the config version they were started with
- Full revision history is preserved

---

## Access control

- **Admin** (`user.role === "admin"`) — creates, edits, publishes, and archives questionnaire configs; reviews submitted assessments; approves or rejects
- **User** (company owner) — fills out the current active assessment; uploads files; submits for review; sees status updates

All admin operations require server-side role check, consistent with the existing admin panel (see `admin-panel.md`).

---

## Database tables

### `assessment_config`

Stores the questionnaire definition as versioned JSONB. Only **one** row may have `status = 'active'` at a time.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `version` | integer | Auto-incrementing revision number (1, 2, 3…) |
| `status` | text: `draft` / `active` / `archived` | Lifecycle state |
| `title` | jsonb `{ de: string, en: string }` | Display title of this questionnaire version |
| `config` | jsonb | Full questionnaire structure (see JSON schema below) |
| `created_by` | text FK → user.id | Admin who created this revision |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Constraints:**
- Unique partial index: only one row where `status = 'active'`
- `version` is unique

### `assessment_submission`

One row per company assessment attempt. Pinned to a specific config version.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `company_id` | uuid FK → companies.id | The company being assessed |
| `config_id` | uuid FK → assessment_config.id | Which config version this submission uses |
| `status` | text: `draft` / `submitted` / `under_review` / `approved` / `rejected` | Lifecycle |
| `admin_notes` | text, nullable | Admin feedback on rejection or review |
| `reviewed_by` | text FK → user.id, nullable | Admin who reviewed |
| `reviewed_at` | timestamp, nullable | |
| `submitted_at` | timestamp, nullable | When the user hit "Submit for Review" |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `assessment_answer`

One row per answered question. Answers are keyed by stable `question_id` from the config.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `submission_id` | uuid FK → assessment_submission.id (cascade delete) | |
| `question_id` | text | Matches `question.id` in the config JSON |
| `value` | jsonb | The answer (see value shapes below) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Constraints:**
- Unique on `(submission_id, question_id)` — one answer per question per submission

### `assessment_file`

One row per uploaded file, linked to the answer it belongs to.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `answer_id` | uuid FK → assessment_answer.id (cascade delete) | |
| `blob_url` | text | Vercel Blob URL |
| `filename` | text | Original filename |
| `mime_type` | text | e.g. `image/jpeg`, `application/pdf` |
| `size_bytes` | integer | File size |
| `created_at` | timestamp | |

---

## Config JSON schema

The `config` column in `assessment_config` holds this structure:

```jsonc
{
  "sections": [
    {
      "id": "accessibility",                          // stable key
      "title": { "de": "Barrierefreiheit", "en": "Accessibility" },
      "description": { "de": "...", "en": "..." },   // optional
      "questions": [
        {
          "id": "entrance-barrier-free",              // stable key
          "type": "yes-no",
          "label": { "de": "Ist der Eingang barrierefrei?", "en": "Is the entrance barrier-free?" },
          "description": { "de": "Hinweistext...", "en": "Helper text..." },
          "required": true,
          "placeholder": { "de": "...", "en": "..." }  // optional, for text inputs
        },
        {
          "id": "entrance-photo",
          "type": "file-upload",
          "label": { "de": "Foto des Eingangs hochladen", "en": "Upload photo of entrance" },
          "required": true,
          "accept": ["image/*"],
          "maxFiles": 3
        },
        {
          "id": "staff-training",
          "type": "single-choice",
          "label": { "de": "Art der Mitarbeiterschulung", "en": "Type of staff training" },
          "required": true,
          "options": [
            { "value": "internal", "label": { "de": "Intern", "en": "Internal" } },
            { "value": "external", "label": { "de": "Extern zertifiziert", "en": "Externally certified" } },
            { "value": "none", "label": { "de": "Keine", "en": "None" } }
          ]
        }
      ]
    }
  ]
}
```

---

## Question types

These are the building blocks available when creating a questionnaire:

### 1. `text` — Short text input

Single-line free text. For names, short descriptions, URLs, etc.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` — the question text |
| `description` | no | `{ de, en }` — helper text shown below the label |
| `placeholder` | no | `{ de, en }` — input placeholder |
| `required` | yes | boolean |
| `minLength` | no | Minimum character count |
| `maxLength` | no | Maximum character count |

**Stored value:** `{ "text": "user input" }`

---

### 2. `textarea` — Long text input

Multi-line free text. For detailed explanations, descriptions of processes, etc.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` |
| `description` | no | `{ de, en }` |
| `placeholder` | no | `{ de, en }` |
| `required` | yes | boolean |
| `minLength` | no | Minimum character count |
| `maxLength` | no | Maximum character count |
| `rows` | no | Number of visible rows (default: 4) |

**Stored value:** `{ "text": "user input\nwith newlines" }`

---

### 3. `yes-no` — Boolean toggle

Simple yes/no question. Renders as two radio buttons or a toggle.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` |
| `description` | no | `{ de, en }` |
| `required` | yes | boolean |

**Stored value:** `{ "answer": true }` or `{ "answer": false }`

---

### 4. `single-choice` — Radio select (pick one)

Choose exactly one option from a list. Renders as radio group or select dropdown depending on option count.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` |
| `description` | no | `{ de, en }` |
| `required` | yes | boolean |
| `options` | yes | Array of `{ value: string, label: { de, en } }` |

**Stored value:** `{ "selected": "option-value" }`

---

### 5. `multi-choice` — Checkbox select (pick many)

Choose one or more options from a list. Renders as a checkbox group.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` |
| `description` | no | `{ de, en }` |
| `required` | yes | boolean — if true, at least one must be selected |
| `options` | yes | Array of `{ value: string, label: { de, en } }` |
| `minSelect` | no | Minimum selections required |
| `maxSelect` | no | Maximum selections allowed |

**Stored value:** `{ "selected": ["value-a", "value-c"] }`

---

### 6. `number` — Numeric input

For quantities, measurements, counts, etc.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` |
| `description` | no | `{ de, en }` |
| `placeholder` | no | `{ de, en }` |
| `required` | yes | boolean |
| `min` | no | Minimum value |
| `max` | no | Maximum value |
| `step` | no | Step increment (e.g. `0.5`) |
| `unit` | no | `{ de, en }` — display unit (e.g. "cm", "Stück") |

**Stored value:** `{ "number": 42 }`

---

### 7. `file-upload` — File attachment

Upload images, PDFs, documents, spreadsheets. Files stored in Vercel Blob.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` |
| `description` | no | `{ de, en }` |
| `required` | yes | boolean |
| `accept` | no | Array of MIME patterns, e.g. `["image/*", ".pdf", ".xlsx", ".docx"]`. If omitted, all file types allowed |
| `maxFiles` | no | Maximum number of files (default: 1) |
| `maxSizeMb` | no | Max file size in MB per file (default: 10) |

**Stored value:** `{ "fileIds": ["uuid-1", "uuid-2"] }` — references `assessment_file.id`

---

### 8. `date` — Date picker

For dates like "when was the last renovation completed?"

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` |
| `description` | no | `{ de, en }` |
| `required` | yes | boolean |
| `minDate` | no | ISO date string — earliest selectable date |
| `maxDate` | no | ISO date string — latest selectable date |

**Stored value:** `{ "date": "2025-06-15" }`

---

### 9. `info` — Read-only informational block (not a question)

Displays text, instructions, or guidance between questions. No user input. Not counted in progress.

| Property | Required | Description |
|----------|----------|-------------|
| `label` | yes | `{ de, en }` — the heading |
| `description` | yes | `{ de, en }` — the body text (supports basic markdown) |

**Stored value:** none — skipped

---

## Common properties on all question types

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Stable unique key within the config (e.g. `"entrance-barrier-free"`) |
| `type` | string | One of the types listed above |
| `label` | `{ de, en }` | The question text |
| `description` | `{ de, en }` | Optional helper/explanation text |
| `required` | boolean | Whether the question must be answered before submission |

---

## User flow

### Starting the assessment

1. User navigates to **Dashboard → Assessment** (new nav item)
2. System loads the **active** `assessment_config`
3. If the user has an existing `draft` submission for this config → resume it
4. If no submission exists → create a new `assessment_submission` with `status = 'draft'`

### Filling out the assessment

1. Wizard UI: one **section** per step, with a sidebar/stepper showing all sections + completion status
2. Questions render dynamically from the config JSON using a component registry (one component per question type)
3. Answers are **auto-saved** on change (debounced) — upsert into `assessment_answer`
4. File uploads are immediate (uploaded to Vercel Blob on selection, file record created)
5. User can navigate freely between sections (no forced order)
6. Progress indicator: `answered required questions / total required questions`

### Submitting

1. User clicks "Submit for Review" on the final review step
2. Client validates: all `required` questions have answers
3. `assessment_submission.status` → `submitted`, `submitted_at` set
4. Audit event written: `assessment.submitted`
5. User sees "Submitted — waiting for review" status

### After submission

- User can view their submitted answers (read-only)
- If rejected: user can edit and re-submit (status goes back to `draft`)
- If approved: certificate/badge issuance flow is triggered

---

## Admin flow

### New admin nav item

| Tab | Path | Purpose |
|-----|------|---------|
| Assessments | `/admin/assessments` | Manage configs + review submissions |

### Assessment config management (`/admin/assessments/configs`)

- List all config versions (version number, status, created by, date)
- **Create new config** → opens the visual builder
- **Duplicate existing config** as new draft → opens in builder pre-filled
- Publish a draft → becomes `active`, previous active → `archived`
- Cannot edit a published config (immutability); must create a new version

### Visual questionnaire builder (`/admin/assessments/builder/[configId]`)

A split-pane editor for visually constructing and previewing questionnaires.

**Layout:**

```
┌──────────────────────────────┬─────────────────────────┐
│  BUILDER (left ~60%)         │  LIVE PREVIEW (right)   │
│                              │                         │
│  [+ Add Section]             │  ┌─ Section 1 ────────┐ │
│                              │  │ Question 1 [text]   │ │
│  ☰ Section: Barrierefreiheit │  │ Question 2 [yes/no] │ │
│    ☰ Ist der Eingang...  ✏️🗑│  │ Question 3 [upload] │ │
│    ☰ Foto des Eingangs   ✏️🗑│  └────────────────────┘ │
│    ☰ Türbreite in cm     ✏️🗑│                         │
│    [+ Add Question]          │  ┌─ Section 2 ────────┐ │
│                              │  │ ...                 │ │
│  ☰ Section: Schulungen       │  └────────────────────┘ │
│    ☰ Art der Schulung    ✏️🗑│                         │
│    [+ Add Question]          │                         │
│                              │                         │
├──────────────────────────────┴─────────────────────────┤
│  [Save Draft]                        [Publish] button  │
└────────────────────────────────────────────────────────┘
```

**Interactions:**

| Action | Behaviour |
|--------|----------|
| ☰ Drag handle on section | Reorder sections via native HTML drag-and-drop |
| ☰ Drag handle on question | Reorder questions within their section via native HTML drag-and-drop |
| ✏️ Edit button | Opens a **shadcn Sheet** (slide-over panel) with the property editor for that question type |
| 🗑 Delete button | Removes question/section with confirmation |
| [+ Add Question] | Opens a **Dialog** with the 9 question types as selectable cards; picking one adds it and opens the editor Sheet |
| [+ Add Section] | Adds a new section with editable title fields (de/en) |
| Right panel | Renders a **live preview** using the same renderer components the customer will see |
| [Save Draft] | Persists current state to `assessment_config` with `status = 'draft'` |
| [Publish] | Sets this config to `active`, archives the previous active config |

**State management:** All edits happen on a local `config` state object (`useReducer`). Changes are reflected immediately in the live preview. Persistence only happens on explicit "Save Draft" or "Publish".

**Builder components:**

| Component | Purpose |
|-----------|---------|
| `BuilderPage` | Server component — loads config from DB, passes to client |
| `BuilderClient` | Client component — `useReducer` for config state, split-pane layout |
| `SortableSectionList` | Renders all sections with native drag-and-drop reorder |
| `SortableQuestionList` | Renders questions within a section with native drag-and-drop reorder |
| `QuestionCard` | Compact card: drag handle, type icon, label preview, edit/delete buttons |
| `QuestionEditorSheet` | shadcn Sheet with form fields specific to the selected question type (labels, options, validation rules, etc.) |
| `QuestionTypePicker` | shadcn Dialog with a grid of the 9 question types — icon + name + short description per type |
| `SectionHeader` | Editable section title (de/en) with drag handle and collapse toggle |
| `AssessmentPreview` | Right panel — reuses the exact customer-facing question renderer components |
| `BuilderToolbar` | Bottom bar with Save Draft / Publish / version info |

### Submission review (`/admin/assessments/submissions`)

- Paginated table: Company, Status, Config Version, Submitted At
- Filter by status (`submitted` / `under_review` / `approved` / `rejected`)
- Click into submission → see all answers organized by section, view/download uploaded files
- Admin actions:

| Action | Effect |
|--------|--------|
| Start review | `status → under_review`, `reviewed_by` set |
| Approve | `status → approved`, triggers badge issuance, audit event |
| Reject | `status → rejected`, admin writes feedback in `admin_notes`, audit event |

---

## Audit events

| Action | Entity Type | When |
|--------|-------------|------|
| `assessment_config.created` | `assessment_config` | Admin creates a new config version |
| `assessment_config.published` | `assessment_config` | Admin publishes a config |
| `assessment_config.archived` | `assessment_config` | Previous active config archived |
| `assessment.started` | `assessment_submission` | User starts a new submission |
| `assessment.submitted` | `assessment_submission` | User submits for review |
| `assessment.review_started` | `assessment_submission` | Admin begins review |
| `assessment.approved` | `assessment_submission` | Admin approves |
| `assessment.rejected` | `assessment_submission` | Admin rejects (notes in metadata) |

---

## Technical notes

- **Drag-and-drop:** Uses **native HTML drag-and-drop** (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) — no external DnD library. Sufficient for simple list reordering of sections and questions. Keyboard-accessible drag reorder deferred to a later a11y overhaul.
- **No external dependencies** needed for the builder beyond existing shadcn/ui components (Sheet, Dialog, Card, Button, Input, Select, Switch, Textarea, Label, RadioGroup, Checkbox).
- File uploads use existing **Vercel Blob** infrastructure (`BLOB_READ_WRITE_TOKEN`)
- Config JSON is validated with **Zod** on save (admin side) and on load (client side) to ensure type safety
- The wizard component reads the config and renders question components from a **component registry** — one React component per question type. Adding a new type = adding one component + one registry entry.
- The **builder preview** and the **customer wizard** share the same renderer components — what the admin sees in the preview is exactly what the customer will see.
- Progress is computed client-side: `answered required questions / total required` — no separate progress column needed
- `assessment_submission.config_id` pins the submission to a specific config version, so publishing a new questionnaire never breaks in-progress work

### Deferred items

- **Keyboard-accessible drag reorder (a11y)** — will be addressed in a dedicated a11y overhaul pass
- **Conditional logic** (show question B only if question A = "yes") — easy to layer on later by adding a `condition` property to the question schema
- **Scoring / weighting** — can be added as optional numeric weights on questions
- **Admin UI for bulk JSON editing** — the visual builder is the primary interface; raw JSON export/import can be added as a power-user feature later
