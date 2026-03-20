# Quiz Featured Lead Slug Design

**Goal**
Reduce admin friction when publishing public quizzes by auto-filling the public slug when it is blank, and make the featured lead replacement behavior explicit before save.

## Scope
- Auto-generate a public quiz slug from the quiz title when the slug field is currently empty.
- Keep the slug editable so admins can override the generated value manually.
- Add clear helper text to the featured lead quiz control explaining that enabling it replaces any current featured quiz and disables any featured free video.
- Cover the new editor behavior with regression tests.

## Approved Direction
- Use one-time slug generation only. If the slug field is blank, typing a title fills it with a slugified version. If the slug already has a value, leave it unchanged.
- Keep the existing featured lead save behavior in the API. Only improve the editor messaging around what will happen.

## Technical Approach
- Add a small shared slugify helper or local utility for the quiz editor so title changes can derive a kebab-case slug.
- Update `src/components/dashboard/education/QuizEditor.tsx` so the title input auto-fills `slug` only while it is empty.
- Add helper copy near `Featured lead quiz` describing the decommissioning of any previous featured quiz or free video.
- Extend the existing dashboard regression test to assert the editor includes the auto-slug logic and the new note text.

## Verification Strategy
- Add or update focused tests for the quiz editor source expectations.
- Run the quiz dashboard test file and confirm the new behavior is covered.
- Check lints for the touched files.

## Non-Goals
- No automatic slug uniqueness resolution in this change.
- No forced slug re-sync after a manual value already exists.
- No change to the backend replacement logic for featured quizzes and featured free videos.
