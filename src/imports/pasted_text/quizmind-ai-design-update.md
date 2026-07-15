You are updating an existing QuizMind AI design — a friendly, playful AI-powered quiz platform for Teachers, Students, and Admins. Style: rounded corners, soft pastels, purple #6C63FF, blue #4FC3F7, mint #43E6B5, yellow #FFD166, warm white #F9F9FF, Poppins font. Keep the same visual style and update/add only what is listed below. Every button, CTA, and link must be prototype-linked to its destination screen.

🔗 CRITICAL RULE — ALL BUTTONS MUST BE LINKED
Every single button, card, nav item, and link in the entire design must be connected to its destination screen using Figma prototype arrows. No dead ends. If a button has no destination yet, link it to a placeholder screen labeled with the screen name.

1. VIEW RESULTS — Add Results Detail Screen (Teacher)
When teacher clicks "View Results" on the dashboard, navigate to a Results Detail screen showing:

Quiz title and class name at the top
List of all students with their score, time taken, and pass/fail badge
Class average score card
Bar chart: per-question performance (how many students got each question right)
AI grading breakdown: confidence score per answer, flagged answers count
Button: "Review Flagged Answers" → links to Flagged Answers Review screen
Button: "Export Results" → shows a success toast "Results exported"


2. CREATE NEW CLASS — Add Class Creation Flow (Teacher)
When teacher clicks "Create New Class" on dashboard, open a modal with:

Class name field (e.g. "S3 Biology 2026")
Subject field
Grade level selector (two-step: education level → sub-level using Rwanda system: Nursery Baby/Middle/Top Class, Primary P1–P6, O-Level S1–S3, A-Level S4–S6, TVET Certificate/Diploma, University Year 1–4)
Auto-generated class join code (e.g. "QMIND-4829") shown in a highlighted box with a copy button
"Create Class" button → closes modal, adds class card to dashboard, shows success toast "Class created"


3. CLASS NAME — Use Consistently Across All Screens
The class name created by the teacher must appear in these places:

Student dashboard: quiz cards show "Class: S3 Biology" under the quiz title
Quiz taking screen: class name shown in the quiz header
Results screen (teacher): class name shown at the top
Admin quiz oversight: class name shown in the quiz list table


4. REVIEW FLAGGED ANSWERS — Add Dedicated Screen (Teacher)
Add a Flagged Answers Review screen accessible from Results Detail. It shows:

List of flagged student answers with: student name, question text, student's answer, AI confidence score (shown as a percentage badge, e.g. "62% confident")
Two action buttons per row: "Accept AI Grade" (green) and "Override Grade" (opens a small modal with a manual score input and a save button)
Filter bar at top: All / Low Confidence / Overridden
Back button → returns to Results Detail screen


5 & 6. USER SETTINGS — Add Settings and Profile Screens (All Roles)
Add a Settings page accessible from the profile avatar or nav menu for Teacher, Student, and Admin. It must include:
Profile section:

Profile photo upload (circle avatar with edit icon)
Full name field (editable)
Email field (editable)
School/institution field
"Save Changes" button → shows success toast

Security section:

"Change Password" button → opens a modal with: Current password, New password, Confirm password fields, and a "Update Password" button
"Reset Password via Email" link → shows a confirmation: "A reset link has been sent to your email"

Notification preferences:

Toggle: Email notifications for quiz deadlines
Toggle: Email notifications when results are ready

Danger zone:

"Delete Account" button (red, requires typing "DELETE" to confirm)

Logout button — visible at the bottom of every dashboard sidebar and settings page for all three roles

7. TEACHER DASHBOARD — Improved Class and Grade View
Improve the Teacher Dashboard to include:

"My Classes" section showing class cards with: class name, subject, grade level, number of students, number of active quizzes
Clicking a class card → goes to Class Detail screen showing:

Class name, subject, join code (with copy button)
Student list: name, email, quizzes completed, average score
Quiz list with columns: quiz title, deadline, average score, status (active/closed)
Clicking a quiz row → goes to Results Detail screen for that quiz


"Add Students" button on Class Detail → opens modal to invite via email or share join code


8. JOIN BUTTON — Make It Functional
The "Join Quiz" button on the Student Dashboard must be prototype-linked as follows:

Student enters a quiz code in the input field
Clicking "Join" navigates to the Quiz Lobby screen for that quiz
If the quiz is closed (past deadline), navigate to a "Quiz Closed" screen showing: "This quiz is no longer accepting submissions ⏳" with a "Back to Dashboard" button
If the code is invalid, show an inline error message: "Quiz not found. Please check your code and try again."


9. ADMIN — Add Full Management Screens
The Admin section must include the following fully designed and linked screens:
Admin Dashboard:

Stats cards: Total Teachers, Total Students, Total Quizzes, AI Gradings Today
Recent activity feed: latest quizzes created, flagged answers, new sign-ups
Quick links to all admin sections

User Management screen:

Table with columns: Name, Email, Role (Teacher/Student), School, Status (Active/Suspended), Actions
Search bar and filter by role
"Suspend" button per row → changes status badge to Suspended (red)
"Activate" button to re-enable
"View Profile" button → opens that user's profile details as a side panel
"Add User" button → opens a form modal to manually create a teacher or student account

Quiz Oversight screen:

Table of all quizzes across platform: Quiz Title, Teacher, Class, Created Date, Deadline, Status, Submissions
"View Results" per quiz → links to Results Detail
"Flag Quiz" button → marks quiz with a red flag badge for review
Filter by: All / Flagged / Active / Closed

AI Grading Logs screen:

Full log table: Quiz Title, Student, Question, AI Score, Confidence, Human Override (yes/no), Date
Filter by confidence level
"Override" button per row → opens manual grade modal

Platform Settings screen (Admin only):

Platform name and logo upload
AI grading sensitivity slider (Low / Medium / High)
Email notification settings
Subscription/billing info card


10. ALL INFO PAGES — Link Every CTA to Its Screen
Go through every screen in the design and ensure:

Every "Learn More" or "How it works" link on the home page → links to a simple How It Works screen (3 steps: Teacher creates quiz → Student takes quiz → AI grades it)
Every "Sign Up" button → links to Sign Up screen
Every "Log In" button → links to Log In screen
Every nav menu item → links to the correct dashboard section
Every "Back" button → links to the previous screen
Every "View" or "See Details" button → links to the relevant detail screen


11. NOTIFICATIONS — Add Notification Screen (All Roles)
Add a notification bell icon in the nav bar for all roles. Clicking it opens a Notifications panel/screen showing:

For Teacher: "Quiz 'S3 Biology Quiz 1' has 3 flagged answers", "15 students have submitted"
For Student: "Quiz 'Chemistry Test' closes in 2 hours", "Your results for 'Math Quiz' are ready — View Results"
For Admin: "New teacher registered", "Quiz flagged for review"
Each notification links to the relevant screen
"Mark all as read" button at the top


12–15. MISSING STATES — Add Empty, Loading, and Error Screens
For every major list screen (dashboard, class list, quiz list, results, student list), add:

Empty state: friendly illustration with message e.g. "No quizzes yet — create your first one! ✨" and a CTA button
Loading state: skeleton loader cards (grey placeholder shapes) while content loads
Error state: friendly message "Something went wrong. Please try again." with a Retry button

Also add a First-Time Onboarding flow triggered after first login for both Teacher and Student:

Teacher: 3-step welcome (Create your first class → Create your first quiz → Invite students)
Student: 2-step welcome (Join a class with your code → Take your first quiz)
Each step has a "Next" button linking to the next step, and a "Skip" link