# Ask Mode

## Question

what is inside the /modes/agent explain me what is going on with code example

## Answer

The `/modes/agent` directory contains various TypeScript files, each with specific responsibilities, primarily centered around an "agent" system that can perform actions in a codebase, track those actions, and manage user approvals. Below is a brief explanation of each file, followed by a code example that demonstrates how these components come together in the system.

### File Explanations

1. **`action-tracker.ts`**: This file defines the `ActionTracker` class, which is responsible for logging actions taken by the agent, updating their statuses, and retrieving logs of past actions. It helps manage the history of changes and shows what actions are pending approval.
   - Example method: `log(entry: Omit<ActionLog, "id" | "timestamp">)`

2. **`agent-tools.ts`**: This exports a function `createAgentTools` which creates a set of tools that the agent can use, such as reading files, modifying files, and executing shell commands. Each tool has an associated description and validation schema.
   - Example tool: `read_file`

3. **`approvals.ts`**: This file contains functionalities related to approval workflows, allowing the agent to request user approval for staged changes. It organizes pending actions into groups and handles user interactions for approval or rejection.
   - Example method: `runApprovalFlow(tracker: ActionTracker)`

4. **`diff-view.ts`**: Contains utilities for showing differences in file contents before and after actions. It formats patches using the `diff` library.
   - Example function: `formatPatch(filePath: string, before: string, after: string)`

5. **`orchestrator.ts`**: Acts as the main driver for running the agent in an interactive mode, prompting users for tasks, and processing user input. It defines how to execute the agent's logic flow.
   - Example function: `runAgentMode()`

6. **`tool-executor.ts`**: This file implements the `ToolExecutor` class, which contains methods that execute file operations (reading, creating, modifying, deleting), as well as running shell commands and code analysis. It ensures actions are tracked and authorized.
   - Example method: `readFile(rel: string)`

7. **`types.ts`**: Defines various types used within the agent, including action types, statuses, and configuration settings.
   - Example type: `ActionLog`

### Code Example

Here is an illustrative example that highlights how the `orchestrator.ts` runs the agent. This example provides an overview of setting up the agent, tracking actions, and running approval flows:

```typescript
import { runAgentMode } from "./orchestrator"; // Main entry point

async function main() {
    // Start the agent mode
    await runAgentMode();
}

// Entry point of the program
main().catch(console.error);
```

When `runAgentMode()` is called:
1. It prompts the user for a task they want the agent to perform.
2. It initializes the `ActionTracker` to keep logs of actions.
3. It sets up the tool executor that will perform file operations.
4. It runs the agent's logic, processing the user-defined goal using the tools it has access to.
5. Finally, it manages approvals through a user interface, allowing the user to review and approve staged changes.

This modular structure allows the system to track changes made by the agent effectively, ensuring user approval is obtained before any modifications are applied to the codebase.
