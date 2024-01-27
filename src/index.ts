import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from 'dotenv';

import config from "./config";

import { commandMap } from "./commands";

dotenv.config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ]
});

async function registerCommand() {
  try {
    console.log(
      `Started reloading ${commandMap.size} application (/) commands.`,
    );

    // prepare commands JSON body
    const commands = [];
    commandMap.forEach((value) => {
      // console.log(value.data.options)
      commands.push(value.data.toJSON());
    });

    const rest = new REST().setToken(process.env.TOKEN);

    // The put method is used to fully refresh all commands in the guild with the current set

    const [data] = await Promise.all(
      config.guild_ids.map(guildId => rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands }
      )
      ))

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Redive Assistant v3 is ready and logged in as ${readyClient.user.tag}`);
  console.log()
  // load slash commands to every server ID in config.guild_ids[]
  registerCommand()
});

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    // console.log(
    //   JSON.stringify(interaction, (key, value) => {
    //     if (typeof value === 'bigint') {
    //       return value.toString();
    //     } else {
    //       return value;
    //     }
    //   })
    // )
    commandMap.get(interaction.commandName).execute(interaction);
  } catch (error) {
    console.error(error)
    interaction.reply(
      {
        content: "指令出現錯誤,請再試一次或者聯絡負責人",
        ephemeral: true
      }
    )
  }
  console.log(`${interaction.user.tag} ran ${interaction.commandName}`);
});

client.login(process.env.TOKEN);