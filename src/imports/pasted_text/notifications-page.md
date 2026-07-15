2. NOTIFICATIONS — Add Full Notifications Page (All Roles)
The current design only shows recent notifications in a small dropdown near the logout button. Add a dedicated full Notifications Page for all three roles (Teacher, Student, Admin) that works as follows:
How to access it:

Add a "See all notifications" link at the bottom of the existing notifications dropdown → clicking it navigates to the full Notifications Page
Also add "Notifications" as a menu item in the sidebar navigation for all three roles

Full Notifications Page layout:

Page title: "Notifications" with a "Mark all as read" button top right
Filter tabs at the top: All / Unread / Read
Each notification shown as a card with: icon (bell, quiz, flag, or user icon depending on type), notification message, timestamp (e.g. "2 hours ago"), and a colored dot for unread status
Clicking any notification card → navigates to the relevant screen (e.g. clicking a quiz result notification → goes to Results Detail)
Empty state for when there are no notifications: friendly illustration with message "You're all caught up! No notifications yet 🎉"

Notification types per role:

Teacher: Quiz submitted by student, Flagged answer needs review, Class join request, Quiz deadline passed
Student: Quiz deadline reminder (2 hours before), Results are ready, New quiz assigned, Class joined successfully
Admin: New teacher registered, New student registered, Quiz flagged for review, System alert


3. TEACHER DASHBOARD — Remove Loaded/Loading/Error Bars
Above the "Quick Actions" title on the Teacher Dashboard there are three visible state bars labeled "Loaded", "Loading", and "Error" — these are dev/test artifacts that should not be visible in the final design. Fix as follows:

Delete all three bars (Loaded, Loading, Error) completely from the Teacher Dashboard frame
Make sure removing them does not leave an empty gap — shift the Quick Actions section upward to fill the space naturally
Keep the loading and error states only as separate hidden frames for developer reference, not visible on the main dashboard


4. QUIZ GENERATOR — Fix "+Add Question" Button (Teacher)
On the Teacher Quiz Generator / Quiz Editor screen, the "+Add Question" button is not working. Fix as follows:

Clicking "+Add Question" → opens a Add Question modal/panel with:

Question type selector: Multiple Choice / Short Answer / True & False (shown as toggle chips)
Question text input field: "Type your question here…"
If Multiple Choice selected: show 4 answer option fields (A, B, C, D) each with a radio button to mark the correct answer, plus an "+ Add option" link to add a 5th or 6th option
If Short Answer selected: show a field for "Model answer / keywords AI should look for"
If True & False selected: show two large toggle cards labeled True and False with a selector to mark which is correct
Points field: number input defaulting to 1 point
"Save Question" button → closes modal, adds the new question to the quiz question list below with a smooth appearance
"Cancel" link → closes modal without saving


Each saved question in the list should show: question number, question text preview, type badge (MCQ/Short/T&F), points, and Edit/Delete icons
Prototype-link the Save Question button so the question visibly appears in the list after clicking


5. ADMIN SYSTEM SETTINGS — Add Subscription & Billing Pages
In the Admin Portal under System Settings, expand the Subscription and Billing section into two fully designed pages:
Page A — Subscription Plan Page:

Current plan card showing: Plan name (e.g. "Starter / Professional / Enterprise"), billing cycle (Monthly/Annual toggle), price, renewal date, and a "Upgrade Plan" or "Manage Plan" button
Three plan comparison cards side by side:

Starter (Free): up to 5 teachers, up to 100 students, basic AI grading, limited quiz history
Professional ($29/month): unlimited teachers, up to 1,000 students, full AI grading, priority support, advanced analytics
Enterprise (Custom): unlimited everything, custom AI model, dedicated support, SLA guarantee, "Contact Sales" button


Current plan highlighted with a "Current Plan" badge
Annual billing toggle at the top showing "Save 20% with annual billing"
Each plan card has a CTA: "Get Started", "Upgrade Now", or "Contact Sales"

Page B — Billing & Payment Page:

Billing summary card: next billing date, amount due, payment method on file (e.g. Visa ending in 4242 with a card icon)
"Update Payment Method" button → opens a modal with card number, expiry, CVV fields and a "Save Card" button
Invoice history table with columns: Invoice #, Date, Amount, Status (Paid/Pending), Download button (PDF icon)
"Download All Invoices" button at the top right of the table
Billing contact email field (editable) with a "Save" button
"Cancel Subscription" button at the bottom in red — clicking shows a confirmation modal: "Are you sure you want to cancel? Your plan will remain active until [renewal date]." with "Yes, Cancel" and "Keep My Plan" buttons


✅ GLOBAL RULES (Apply to All Fixes Above)

Match the existing friendly playful style exactly — rounded corners, soft shadows, pastel colors, Poppins font
Every new button and link must be prototype-linked to its destination screen
Every new modal must have a close/cancel option linked back to the previous screen
Do not change or remove any existing screens not mentioned above
Design both desktop (1440px) and mobile (375px) versions for every new screen added
