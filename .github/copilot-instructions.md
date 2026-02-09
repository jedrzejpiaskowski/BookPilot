# BookPilot Project Instructions

## Prompt Logging

For every user prompt received in this project, append it to a log file in the following format:

**File Location:** `docs/prompts/prompt-log.md`

**Format:**
```
----------
<date: dd-MM-yy HH:mm>
----------
<prompt text>

```

**Requirements:**
- Use the current date and time in 24-hour format (dd-MM-yy HH:mm)
- Append to the existing file (do not overwrite)
- Include a blank line after each prompt entry
- Save the prompt exactly as entered by the user
- Execute this logging step for every new user request before proceeding with the actual task

**Example Entry:**
```
----------
09-02-26 14:30
----------
Can you help out with creating of 'BookPilot' react app?

```
