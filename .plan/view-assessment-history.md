# Implementation Plan: "View My Assessment History" Feature

## Overview
Enhance the existing `AssessmentHistoryModal` to query the backend database (not just localStorage), display first/last name on each card, support card click for full details, and fix the `first-assessment.png` rendering issue.

---

## Issues Identified

### 1. Image Not Rendering (`first-assessment.png`)
- **File**: `frontend/public/illustrations/first-assessment.png` (109KB, exists)
- **Current src**: `/illustrations/first-assessment.png` — path is correct for Vite's `public/` dir
- **Root cause**: `loading="lazy"` on an image inside a `createPortal` modal can prevent the browser from loading it since the element isn't in the viewport at mount time. Additionally, the `decoding="async"` attribute may delay rendering.
- **Fix**: Remove `loading="lazy"` and `decoding="async"` from the `<img>` tag.

### 2. Missing First/Last Name on Cards
- **Current**: Cards show date, BMI, age only
- **Needed**: First name + last name (from `RiskAssessment.fullName`)
- **Backend gap**: `GET /submissions/{national_id}` does NOT return `full_name`. The `Person` table has `full_name` but the submission endpoints don't JOIN with it.

### 3. No Card Click Behavior
- **Current**: Cards are static `<li>` elements with no click handler
- **Needed**: Clicking a card shows full assessment details (expand within the modal)

### 4. Data Source: localStorage vs Database
- **Current**: `SurveyPage` loads from localStorage only (`loadAssessmentHistoryByNationalId`)
- **Needed**: Query the backend database via `HttpHistoryRepository`
- **Note**: `HttpHistoryRepository` exists and is wired in DI, but the modal doesn't use it — it receives `history` as a prop from `HealthDashboard`

---

## Implementation Steps

### Step 1: Backend — Enrich Submission Endpoints with `full_name`

**File**: `backend/main.py`

Update both `GET /submissions/{national_id}` and `GET /persons/{national_id}/submissions` to JOIN with `Person` and return `full_name`:

```python
# /submissions/{national_id} — add full_name to response
@app.get("/submissions/{national_id}")
async def get_submissions(national_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(SurveySubmission, Person.full_name)
        .join(Person, SurveySubmission.person_national_id == Person.national_id)
        .filter(SurveySubmission.person_national_id == national_id)
        .order_by(SurveySubmission.created_at.desc())
        .all()
    )
    if not rows:
        raise HTTPException(status_code=404, detail="هیچ سابقه‌ای یافت نشد.")
    return [
        {
            "id": submission.id,
            "full_name": full_name,
            "risk_score": submission.risk_score,
            "risk_level": submission.risk_level,
            "bmi": submission.bmi,
            "age": submission.age,
            "height": submission.height,
            "weight": submission.weight,
            "created_at": submission.created_at.isoformat(),
        }
        for submission, full_name in rows
    ]
```

Apply the same pattern to `/persons/{national_id}/submissions`.

### Step 2: Frontend — Update `HttpHistoryRepository` DTO and Mapper

**File**: `frontend/src/modules/survey/infrastructure/repositories/http-history.repository.ts`

Update `SubmissionDto` to include `full_name`, `age`, `height`, `weight`. Update `dtoToRecord` to map these fields properly instead of using placeholder values.

### Step 3: Frontend — Make Modal Fetch from Backend

**File**: `frontend/src/modules/survey/presentation/components/dashboard/AssessmentHistoryModal.tsx`

- Add `nationalId` prop
- Use `useSurveyDependencies()` to get `historyRepository`
- On modal open + nationalId change, call `historyRepository.fetchByNationalId(nationalId)`
- Manage loading/error/empty states internally
- Keep `history` prop as fallback (for localStorage data)

### Step 4: Frontend — Add First/Last Name to Assessment Cards

**File**: `frontend/src/modules/survey/presentation/components/dashboard/AssessmentHistoryModal.tsx`

In the card rendering (`history.map(...)`), add the person's name from `record.assessment.fullName`:
- Split `fullName` into first name (first word) and last name (remaining words)
- Display below the date

### Step 5: Frontend — Add Card Click-to-Expand for Full Details

**File**: `frontend/src/modules/survey/presentation/components/dashboard/AssessmentHistoryModal.tsx`

- Add `expandedCardId` state (`number | null`)
- Make each card a clickable button
- On click, toggle expanded state showing full assessment details:
  - Full name, age, BMI, height, weight
  - All organ risk percentages (lung, gastric, colon, pancreas, stroke, cardiac, metabolic, liver)
  - Assessment flags summary
- Use `AnimatePresence` for smooth expand/collapse animation

### Step 6: Frontend — Pass `nationalId` to Modal

**File**: `frontend/src/modules/survey/presentation/components/dashboard/HealthDashboard.tsx`

- Accept `nationalId` prop (or extract from `record`)
- Pass it to `AssessmentHistoryModal`

**File**: `frontend/src/modules/survey/presentation/pages/SurveyPage.tsx`

- Pass `nationalId` to `HealthDashboard`

### Step 7: Fix Image Rendering

**File**: `frontend/src/modules/survey/presentation/components/dashboard/AssessmentHistoryModal.tsx`

Remove `loading="lazy"` and `decoding="async"` from the `<img>` tag:
```diff
- loading="lazy"
- decoding="async"
+ loading="eager"
```

---

## Files to Modify

| # | File | Changes |
|---|------|---------|
| 1 | `backend/main.py` | JOIN Person in submission endpoints, return `full_name`, `age`, `height`, `weight` |
| 2 | `frontend/.../http-history.repository.ts` | Update DTO interface and mapper |
| 3 | `frontend/.../AssessmentHistoryModal.tsx` | Fetch from backend, show names, card click expand, fix image |
| 4 | `frontend/.../HealthDashboard.tsx` | Pass `nationalId` to modal |
| 5 | `frontend/.../SurveyPage.tsx` | Pass `nationalId` to HealthDashboard |

---

## Verification
1. Start backend: `cd backend && python -m uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Complete an assessment → dashboard shows
4. Click "مشاهده سوابق ارزیابی‌های من" → modal opens
5. **Empty state**: Image renders correctly, Persian text shows
6. **With history**: Cards show name, date, BMI, age; clicking a card expands to show full details
7. Check browser DevTools Network tab: verify `GET /submissions/{nationalId}` is called
