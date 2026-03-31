# Bugfix Requirements Document

## Introduction

The "Upcoming Interviews" section on the Dashboard displays no interviews. The root cause is a field mismatch: the frontend filters companies using `c.interviewDate`, but the database stores the relevant date in the `date` column. The `interview_date` column exists in the DB but is always NULL, so no interviews ever pass the filter. This fix corrects the field reference and adds the missing UI section.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a company has `stage === "interview"` and a valid future date stored in the `date` column THEN the system does not display it in the "Upcoming Interviews" section because it filters on `c.interviewDate` which is always undefined
1.2 WHEN the Dashboard renders THEN the system shows an empty "Upcoming Interviews" section regardless of how many interview-stage companies exist with valid `date` values

### Expected Behavior (Correct)

2.1 WHEN a company has `stage === "interview"` (case-insensitive) and a valid `date` value that is today or in the future THEN the system SHALL display it in the "Upcoming Interviews" section with the company name, role, and a time label ("Today", "Tomorrow", or "in N days")
2.2 WHEN multiple upcoming interviews exist THEN the system SHALL sort them ascending by `date` (nearest first)
2.3 WHEN an interview's `date` is in the past THEN the system SHALL NOT include it in the "Upcoming Interviews" section

### Unchanged Behavior (Regression Prevention)

3.1 WHEN companies are displayed in the "Recent Applications" section THEN the system SHALL CONTINUE TO sort and display them by `added` date as before
3.2 WHEN the Application Funnel renders THEN the system SHALL CONTINUE TO count companies per stage using the existing `stage` field logic
3.3 WHEN the Today's Focus task list renders THEN the system SHALL CONTINUE TO filter and display tasks by `date` and `completed` fields as before
3.4 WHEN a company has a stage other than "interview" THEN the system SHALL CONTINUE TO exclude it from the upcoming interviews list
3.5 WHEN `dateUtils.js` helper functions `todayStr`, `offsetDate`, and `formatDisplay` are called THEN the system SHALL CONTINUE TO return correct results as before
