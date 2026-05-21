# Requirements Document

## Introduction

The To-Do List Dashboard is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It serves as a personal productivity dashboard that combines a time-aware greeting, a focus timer, a task manager, and a quick links panel — all running in the browser with no backend required. Data is persisted using the browser's Local Storage API.

## Glossary

- **Dashboard**: The single-page web application that hosts all four feature panels.
- **Greeting_Panel**: The UI component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The UI component that manages a 25-minute countdown timer with start, stop, and reset controls.
- **Task_Manager**: The UI component responsible for creating, editing, completing, and deleting tasks.
- **Task**: A single to-do item with a text description and a completion status.
- **Quick_Links_Panel**: The UI component that displays user-defined shortcut buttons linking to external websites.
- **Link**: A user-defined entry consisting of a label and a URL.
- **Local_Storage**: The browser's Web Storage API used to persist data client-side across sessions.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari in their current stable releases.
- **Theme**: The active color scheme of the Dashboard, either "light" or "dark".
- **Theme_Toggle**: The UI control that switches the Dashboard between light mode and dark mode.

---

## Requirements

### Requirement 1: Time and Date Greeting

**User Story:** As a user, I want to see the current time, date, and a greeting based on the time of day, so that I have immediate context when I open the dashboard.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Greeting_Panel SHALL display the current local time in 12-hour format with AM/PM (e.g., "2:30 PM").
2. WHEN the Dashboard loads, THE Greeting_Panel SHALL display the current local date in "Day, Month DD" format (e.g., "Thursday, May 21").
3. WHILE the Dashboard is open, THE Greeting_Panel SHALL update the displayed time and greeting every 60 seconds to reflect the current local time.
4. IF the local time is between 05:00 and 11:59, THEN THE Greeting_Panel SHALL display the greeting "Good Morning".
5. IF the local time is between 12:00 and 17:59, THEN THE Greeting_Panel SHALL display the greeting "Good Afternoon".
6. IF the local time is between 18:00 and 21:59, THEN THE Greeting_Panel SHALL display the greeting "Good Evening".
7. IF the local time is between 22:00 and 04:59, THEN THE Greeting_Panel SHALL display the greeting "Good Night".
8. IF the local time cannot be determined, THEN THE Greeting_Panel SHALL display a neutral fallback greeting "Hello" and omit the time and date fields.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can use the Pomodoro technique to manage my focus sessions.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Focus_Timer SHALL display an initial countdown value of 25:00 (MM:SS).
2. WHEN the user activates the start control and the timer is not already running, THE Focus_Timer SHALL begin counting down from the current displayed time in one-second intervals.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and reset the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop counting, display 00:00, and provide a visual or audible cue to notify the user the session has ended.
7. IF the user activates the start control while the timer is already counting down, THEN THE Focus_Timer SHALL ignore the action and continue counting.
8. WHEN the Dashboard loads or is refreshed, THE Focus_Timer SHALL reset to 25:00 regardless of any prior timer state.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, and delete tasks that persist across browser sessions, so that I can track my to-dos without losing them when I close the tab.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task description of 500 characters or fewer, THE Task_Manager SHALL add a new Task to the list and display it immediately.
2. IF the user submits an empty or whitespace-only task description, THEN THE Task_Manager SHALL not add a Task and SHALL display an inline validation message.
3. WHEN the user activates the edit control on a Task, THE Task_Manager SHALL allow the user to modify the Task's text description inline.
4. WHEN the user confirms an edit with a non-empty description of 500 characters or fewer, THE Task_Manager SHALL save the updated text and exit edit mode.
5. IF the user confirms an edit with an empty, whitespace-only, or greater-than-500-character description, THEN THE Task_Manager SHALL not save the change and SHALL display an inline validation message.
6. WHEN the user activates the complete control on a Task, THE Task_Manager SHALL toggle the Task's completion status and SHALL visually distinguish completed tasks with a strikethrough on the task text and a visually distinct style from incomplete tasks.
7. WHEN the user activates the delete control on a Task, THE Task_Manager SHALL remove the Task from the list immediately.
8. WHEN any Task is added, edited, completed, or deleted, THE Task_Manager SHALL persist the updated task list to Local_Storage.
9. WHEN the Dashboard loads, THE Task_Manager SHALL read the task list from Local_Storage and display all previously saved Tasks.
10. IF Local_Storage contains no task data, THEN THE Task_Manager SHALL display an empty list with no error.
11. IF a Local_Storage write operation fails, THEN THE Task_Manager SHALL display an inline error message indicating the task list could not be saved.
12. WHEN the user cancels an active edit on a Task, THE Task_Manager SHALL discard any changes and restore the Task's original text.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and display shortcut buttons for my favorite websites, so that I can open them quickly from the dashboard.

#### Acceptance Criteria

1. WHEN the user submits a label of 1–50 characters and a URL beginning with "http://" or "https://" that is 2048 characters or fewer and not a duplicate of an existing link, THE Quick_Links_Panel SHALL add a new Link and display it as a clickable button within 300 milliseconds.
2. IF the user submits an empty or whitespace-only label or an empty or whitespace-only URL, THEN THE Quick_Links_Panel SHALL not add the Link and SHALL display an inline validation message.
3. IF the user submits a URL that does not begin with "http://" or "https://", THEN THE Quick_Links_Panel SHALL not add the Link and SHALL display an inline validation message indicating an invalid URL format.
4. WHEN the user activates a Link button, THE Quick_Links_Panel SHALL open the associated URL in a new browser tab.
5. WHEN the user activates the delete control on a Link, THE Quick_Links_Panel SHALL remove the Link from the panel immediately.
6. WHEN any Link is added or deleted, THE Quick_Links_Panel SHALL persist the updated link list to Local_Storage.
7. WHEN the Dashboard loads, THE Quick_Links_Panel SHALL read the link list from Local_Storage and display all previously saved Links.
8. IF Local_Storage contains no link data, THEN THE Quick_Links_Panel SHALL display an empty panel with no error.
9. IF a Local_Storage write operation fails, THEN THE Quick_Links_Panel SHALL display an inline error message and preserve the previously displayed link list.
10. IF the user attempts to add a Link when 50 links already exist, THEN THE Quick_Links_Panel SHALL reject the addition and display an inline message indicating the maximum link limit has been reached.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my tasks and quick links to survive page refreshes and browser restarts, so that I never lose my data unexpectedly.

#### Acceptance Criteria

1. THE Dashboard SHALL use the browser Local_Storage API as the sole data persistence mechanism.
2. WHEN a Task or Link is added, edited, completed, or deleted, THE Dashboard SHALL immediately serialize the updated data as a JSON string and write it to Local_Storage.
3. WHEN the Dashboard initializes, THE Dashboard SHALL read from Local_Storage and deserialize the stored JSON into the in-memory tasks list and quick-links list.
4. IF Local_Storage is unavailable, throws an error, or contains corrupted/unparseable JSON during a read or write operation, THEN THE Dashboard SHALL display a non-blocking warning message to the user and continue operating with in-memory data.
5. WHEN the Dashboard page loads, THE Dashboard SHALL complete all Local_Storage reads and populate all panels before rendering the page as interactive.

---

### Requirement 6: Browser Compatibility and Layout

**User Story:** As a user, I want the dashboard to work correctly in any modern browser and display cleanly on a standard desktop screen, so that I can use it regardless of my browser preference.

#### Acceptance Criteria

1. THE Dashboard SHALL function in the current stable release of Chrome, Firefox, Edge, and Safari without requiring plugins or extensions, with no JavaScript console errors, all interactive elements responding to user input, and no UI clipping or overlap.
2. THE Dashboard SHALL render all four panels — Greeting_Panel, Focus_Timer, Task_Manager, and Quick_Links_Panel — fully on a single page at a viewport of 1280×720 pixels or larger, with no panel clipped, overflowing, or overlapping another.
3. THE Dashboard SHALL use only HTML, CSS, and Vanilla JavaScript with no external frameworks, libraries, or backend server.
4. WHEN the Dashboard page is loaded on a connection of ≥10 Mbps download speed, THE Dashboard SHALL display all content within 2 seconds.

---

### Requirement 7: Light / Dark Mode

**User Story:** As a user, I want to toggle the dashboard between a light and dark color theme, so that I can choose a visual style that suits my environment or preference.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a visible toggle control that switches the color theme between light mode and dark mode.
2. WHEN the user activates the theme toggle control while the Dashboard is in light mode, THE Dashboard SHALL immediately apply the dark color theme to all panels and UI elements.
3. WHEN the user activates the theme toggle control while the Dashboard is in dark mode, THE Dashboard SHALL immediately apply the light color theme to all panels and UI elements.
4. WHEN the user activates the theme toggle control, THE Dashboard SHALL persist the selected theme value to Local_Storage.
5. WHEN the Dashboard loads, THE Dashboard SHALL read the persisted theme value from Local_Storage and apply it before rendering the page as interactive.
6. IF Local_Storage contains no persisted theme value, THEN THE Dashboard SHALL apply the light color theme as the default.
7. IF a Local_Storage write operation for the theme value fails, THEN THE Dashboard SHALL display an inline error message indicating the theme preference could not be saved, and continue operating with the currently applied theme.

---

### Requirement 8: Prevent Duplicate Tasks

**User Story:** As a user, I want the dashboard to reject tasks that duplicate an existing task description, so that my task list stays clean and free of redundant entries.

#### Acceptance Criteria

1. WHEN the user submits a task description whose trimmed, case-insensitive value matches the trimmed, case-insensitive value of an existing Task in the list, THE Task_Manager SHALL not add the new Task and SHALL display an inline validation message indicating a duplicate task already exists.
2. WHEN the user confirms an edit on a Task with a trimmed, case-insensitive description that matches the trimmed, case-insensitive value of a different existing Task, THE Task_Manager SHALL not save the change and SHALL display an inline validation message indicating a duplicate task already exists.
3. WHEN the user submits a task description that is unique after trimming and case-insensitive comparison, THE Task_Manager SHALL proceed with the normal task-addition flow defined in Requirement 3.
4. WHEN the user confirms an edit on a Task with a description that is unique after trimming and case-insensitive comparison, THE Task_Manager SHALL proceed with the normal edit-save flow defined in Requirement 3.

---

### Requirement 9: Custom Name in Greeting

**User Story:** As a user, I want to enter my name so the dashboard greets me personally, so that the dashboard feels tailored to me.

#### Acceptance Criteria

1. THE Greeting_Panel SHALL provide an input control that allows the user to enter or update their display name.
2. WHEN the user submits a non-empty, non-whitespace-only name of 50 characters or fewer, THE Greeting_Panel SHALL incorporate the trimmed name into the greeting message (e.g., "Good Morning, Alex").
3. WHEN the user submits a non-empty, non-whitespace-only name of 50 characters or fewer, THE Greeting_Panel SHALL persist the trimmed name to Local_Storage.
4. IF the user submits an empty or whitespace-only name, THEN THE Greeting_Panel SHALL clear the stored name from Local_Storage and revert to the generic greeting form (e.g., "Good Morning").
5. IF the user submits a name exceeding 50 characters, THEN THE Greeting_Panel SHALL not save the name and SHALL display an inline validation message indicating the name must be 50 characters or fewer.
6. WHEN the Dashboard loads, THE Greeting_Panel SHALL read the persisted name from Local_Storage and, if a valid name is found, display the personalized greeting form immediately.
7. IF Local_Storage contains no persisted name, THEN THE Greeting_Panel SHALL display the generic greeting form (e.g., "Good Morning") with no error.
8. IF a Local_Storage write operation for the name fails, THEN THE Greeting_Panel SHALL display an inline error message indicating the name could not be saved, and continue displaying the personalized greeting for the current session.
