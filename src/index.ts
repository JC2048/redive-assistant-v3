import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from 'dotenv';

import config from "./config";

import commandMap from "./commands";

dotenv.config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

async function registerCommand() {
  try {
    console.log(
      `Started refreshing ${commandMap.size} application (/) commands.`,
    );

    // prepare commands JSON body
    const commands = [];
    commandMap.forEach((value) => {
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

  // load slash commands to every server ID in config.guild_ids[]
  // registerCommand()
});

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isCommand()) return;
  try {
    commandMap.get(interaction.commandName).execute(interaction);
  } catch (error) {
    console.error(error)
    interaction.reply('Command failed to run, please try again')
  }
  console.log(`${interaction.user.tag} ran ${interaction.commandName}`);
});

client.login(process.env.TOKEN);