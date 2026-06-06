import {select , isCancel} from "@clack/prompts";
import chalk from "chalk"
import figlet from "figlet";
import { runCliMode } from "../modes/cli";
import { runTelegramMode } from "../modes/telegram";

// import { runTelegramMode } from "../modes/telegram";

const BANNER_FONT = 'ANSI Shadow';
const SHADOW = chalk.hex('#5b4d9e');
const FACE = chalk.hex('#e8dcf8').bold;

function printBannerWithShadow(ascii: string) {

  const bannerLines = ascii.replace(/\s+$/, '').split('\n');
  const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
  const rowWidth = maxLen + 2;

  for (const line of bannerLines) {
    console.log(SHADOW(('  ' + line).padEnd(rowWidth)));
  }
  process.stdout.write(`\x1b[${bannerLines.length}A`);
  for (const line of bannerLines) {
    console.log(FACE(line.padEnd(rowWidth)));
  }
  console.log();
}



export async function runWakeup() {
    let ascii:string;
    try {
        ascii = figlet.textSync("YASHU-CLI" , {font:BANNER_FONT})
    } catch (error) {
        ascii = figlet.textSync("YASHU-CLI" , {font:"Standard"})
    }

    printBannerWithShadow(ascii)
    const mode = await select({
        message: "Choose your mode",
        options: [
          { value: "cli", label: "CLI Mode" },
          { value: "telegram", label: "Telegram Mode" },
          {value:"exit", label:"Exit"}
        ]
    })
    if (isCancel(mode || mode === "exit")) {
      console.log(chalk.dim("exiting..."));
      return;
    }
    if(mode === "cli"){
      await runCliMode()
      console.log(chalk.dim("starting cli mode..."))
    }
    else if(mode === "telegram"){
      await runTelegramMode()
      console.log(chalk.dim("starting telegram mode..."))
    }
  }