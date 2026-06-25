
import { isCancel, text } from "@clack/prompts";
import chalk from "chalk";
import { defaultAgentConfig } from "./types";
import { ActionTracker } from "./action-tracker";
import { ToolExecutor } from "./tool-executor";
import { createAgentTools } from "./agent-tools";
import { stepCountIs, ToolLoopAgent } from "ai";
import { getAgentModel } from "../../ai";
import { renderTerminalMarkdown } from "../../tui/terminal-md";

import { runApprovalFlow } from "./approvals";

export async function runAgentMode() {
  console.log(chalk.bold("\n🤖 Agent Mode\n"));
  console.log(chalk.dim("Type 'bye' to exit agent mode.\n"));

  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
  const tools = createAgentTools(executor);

  const agent = new ToolLoopAgent({
    model: getAgentModel(),
    stopWhen: stepCountIs(40),
    instructions: [
      `Workspace root: ${config.codebasePath}`,
      "All mutations are staged until approval.",
    ].join("\n"),
    tools,
  });

  while (true) {
    const goal = await text({
      message: "Agent>",
      placeholder: "What should I do next? (type 'bye' to exit)",
    });

    if (isCancel(goal)) {
      console.log(chalk.yellow("\nExiting Agent Mode...\n"));
      break;
    }

    const input = goal.trim();

    if (!input) continue;

    if (
      input.toLowerCase() === "bye" ||
      input.toLowerCase() === "exit" ||
      input.toLowerCase() === "quit"
    ) {
      console.log(chalk.yellow("\nLeaving Agent Mode...\n"));
      break;
    }

    try {
      const result = await agent.generate({
        prompt: input,
        onStepFinish: ({ toolCalls }) => {
          for (const tc of toolCalls) {
            const preview = JSON.stringify(tc.input).slice(0, 160);

            console.log(
              chalk.green("  ✓"),
              chalk.bold(String(tc.toolName)),
              chalk.dim(
                preview + (preview.length >= 160 ? "..." : "")
              ),
            );
          }
        },
      });

      if (result.text?.trim()) {
        console.log(renderTerminalMarkdown(result.text));
      }

      const ok = await runApprovalFlow(tracker);

      if (!ok) {
        executor.clearStaging();
        console.log(
          chalk.yellow("\nChanges discarded.\n")
        );
        continue;
      }

      const { errors } = executor.applyApprovedFromTracker();

      if (errors.length) {
        console.log(
          chalk.red(
            "\nSome operations could not be completed successfully:\n",
          ),
        );

        for (const error of errors) {
          console.log(chalk.red(`  • ${error}`));
        }
      } else {
        console.log(
          chalk.green(
            "\n✓ All approved changes have been applied successfully.\n",
          ),
        );
      }
    } catch (error) {
      console.error(
        chalk.red(
          "\n✗ Agent execution failed due to an unexpected error.\n",
        ),
      );

      if (error instanceof Error) {
        console.error(chalk.red(`Message: ${error.message}`));

        if (error.stack) {
          console.error(chalk.dim(error.stack));
        }
      } else {
        console.error(chalk.red(String(error)));
      }
    } finally {
      executor.clearStaging();
    }
  }
}