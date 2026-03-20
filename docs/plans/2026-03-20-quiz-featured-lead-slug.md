# Quiz Featured Lead Slug Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-fill a public quiz slug when the field is blank and add clear admin messaging that featuring a quiz will replace any existing featured quiz or featured free video.

**Architecture:** Keep the change local to the quiz dashboard editor and its existing source-based regression test. The editor will derive a kebab-case slug from the title only when `slug` is currently empty, while the featured lead note will document the already-existing backend replacement behavior without changing the API flow.

**Tech Stack:** Next.js, React client components, TypeScript, Vitest

---

### Task 1: Lock the intended editor behavior with a failing test

**Files:**
- Modify: `tests/dashboard/quiz-featured-lead-settings.test.ts`
- Reference: `src/components/dashboard/education/QuizEditor.tsx`

**Step 1: Write the failing test**

Update the existing test so it also asserts that the editor source includes:
- a slugify helper or equivalent slug-generation logic
- logic that only auto-fills the slug when the current slug is empty
- helper copy explaining that enabling featured lead replaces any featured quiz and removes any featured free video

Example assertions to add:

```ts
expect(quizEditor).toContain("function slugify");
expect(quizEditor).toContain("p.slug ? p.slug : slugify");
expect(quizEditor).toContain("replace any currently featured quiz");
expect(quizEditor).toContain("remove any featured free video");
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/dashboard/quiz-featured-lead-settings.test.ts`

Expected: `FAIL` because `QuizEditor.tsx` does not yet contain the slug auto-fill logic or the new helper note text.

**Step 3: Write minimal implementation**

Do not implement yet. Move to Task 2 after the test fails for the expected reason.

**Step 4: Run test to verify it still targets missing behavior**

Re-run if needed: `npm test -- tests/dashboard/quiz-featured-lead-settings.test.ts`

Expected: still `FAIL` only because the new editor behavior is not present yet.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 2: Implement one-time slug auto-fill and featured replacement note

**Files:**
- Modify: `src/components/dashboard/education/QuizEditor.tsx`
- Test: `tests/dashboard/quiz-featured-lead-settings.test.ts`

**Step 1: Write the minimal editor change**

Add a small local `slugify()` helper near the top of `QuizEditor.tsx` that:
- trims whitespace
- lowercases text
- replaces non-alphanumeric runs with `-`
- trims leading and trailing `-`

Then update the title input handler so it sets:

```ts
setForm((p) => ({
  ...p,
  title: value,
  slug: p.slug ? p.slug : slugify(value),
}));
```

Keep the existing slug input editable so admins can override the generated value.

**Step 2: Add the featured lead note**

Under the `Featured lead quiz` label, add short helper text such as:

```tsx
<p className="text-xs text-admin-text-muted">
  If enabled, this quiz will replace any currently featured quiz and will also remove any featured free video.
</p>
```

Keep the copy close to the checkbox so the consequence is visible before save.

**Step 3: Run the focused test**

Run: `npm test -- tests/dashboard/quiz-featured-lead-settings.test.ts`

Expected: `PASS`

**Step 4: Run lint checks for touched files**

Run: `npm run lint`

Expected: no new lint errors from `QuizEditor.tsx` or the updated test.

**Step 5: Commit**

Do not create a commit unless the user explicitly asks for one.

### Task 3: Final verification and handoff

**Files:**
- Review: `src/components/dashboard/education/QuizEditor.tsx`
- Review: `tests/dashboard/quiz-featured-lead-settings.test.ts`

**Step 1: Confirm user-facing behavior**

Verify in code review that:
- typing a title fills the slug only when the slug field starts empty
- editing the slug manually preserves the manual value on later title changes
- the featured lead note clearly explains that previous featured lead content will be decommissioned

**Step 2: Re-run the focused test for a clean final pass**

Run: `npm test -- tests/dashboard/quiz-featured-lead-settings.test.ts`

Expected: `PASS` with no unexpected warnings

**Step 3: Optional browser check if requested**

If the user wants UI verification, inspect the quiz editor in the dashboard and confirm the slug auto-fills and the helper note renders correctly.

**Step 4: Commit**

Do not create a commit unless the user explicitly asks for one.
