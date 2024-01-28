import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from 'dotenv';
import PocketBase from 'pocketbase'

import config from "./config";

import { commandMap } from "./commands";

import { DatabaseGuildSetting } from "./types/Database";

dotenv.config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ]
});


const db = new PocketBase(process.env.DB_ADDRESS)
const settings = new Map<string, DatabaseGuildSetting>()

console.log(`Database at ${process.env.DB_ADDRESS}`)

export { client, db, settings, config }

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
      ))
    )

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Redive Assistant v3 is ready and logged in as ${readyClient.user.tag}`);
  console.log()
  // $ load slash commands to every server ID in config.guild_ids[]
  // registerCommand()

  try {
    const authData = await db.admins.authWithPassword(process.env.DB_ADMIN_EMAIL, process.env.DB_ADMIN_PASSWORD)
    if (!db.authStore.isValid || !db.authStore.isAdmin) {
      throw new Error('Invalid Admin Auth')
    }

    // map setting to meta
    const settingList = await db.collection('guild_setting').getFullList()
    settingList.forEach(async (setting) => {
      settings.set(setting.guildId, setting as DatabaseGuildSetting)
      // set nickname
      const guild = await client.guilds.fetch(setting.guildId)
      const me = await guild.members.fetchMe()
      await me.setNickname(setting.bot.nickname)
    })

    console.log("Loaded guild settings into cache")
  } catch (error) {
    console.log('There is a problem setting up PocketBase data')
    console.error(error)
  }
})

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
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