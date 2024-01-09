import Command from '../interface/Command';

import * as Commands from '.';

const commandMap = new Map<string, Command>();

const keys = Object.keys(Commands);
for (const key of keys) {
  commandMap.set(key, Commands[key]);
}

export default commandMap