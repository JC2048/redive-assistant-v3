import Command from "interface/Command";

import * as memberCommands from "./member";
import * as adminCommands from "./admin";
import * as utilCommands from "./util";
import * as sysCommands from "./sys";

function setCommandGroup(commands): Map<string, Command> {

  const commandMap = new Map<string, Command>()
  const keys = Object.keys(commands);
  for (const key of keys) {
    commandMap.set(key, commands[key]);
  }
  return commandMap
}

export const commandMap = new Map<string, Command>(
  [
    ...setCommandGroup(memberCommands),
    ...setCommandGroup(adminCommands),
    ...setCommandGroup(utilCommands),
    ...setCommandGroup(sysCommands)
  ]
)