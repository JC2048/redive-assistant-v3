import { Client, Options, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from 'dotenv';
import PocketBase from 'pocketbase';

import config from "./config";

import { commandMap } from "./commands";

import { DatabaseGuildSetting } from "./types/Database";

dotenv.config()

const db: PocketBase = new PocketBase(process.env.DB_ADDRESS)
const settings = new Map<string, DatabaseGuildSetting>()

try {
  db.admins.authWithPassword(process.env.DB_ADMIN_EMAIL, process.env.DB_ADMIN_PASSWORD)
    .then(() => {
      if (!db.authStore.isValid || !db.authStore.isAdmin) {
        throw new Error('Invalid Admin Auth')
      }

      console.log(`Database at ${process.env.DB_ADDRESS}`)
    })
} catch (error) {
  console.log('There is a problem setting up PocketBase data')
  console.error(error)
}

// get all guild data and add user role to the set
const memberRoleSet = new Set()

db.collection('guild_setting').getFullList<DatabaseGuildSetting>()
  .then(guildSettings => {
    for (const guildSetting of guildSettings) {

      // put member role into set
      memberRoleSet.add(guildSetting.user.roleId)

      // put setting into setting cache map
      settings.set(guildSetting.guildId, guildSetting)

    }
    console.log("Loaded guild settings into cache")

  })

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
    // GatewayIntentBits.MessageContent,
  ],
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    GuildMemberManager: {
      keepOverLimit: member => member.id === member.client.user.id || memberRoleSet.has(member.id)
    }
  }),
});

export { client, db, settings, config, memberRoleSet }

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

    await Promise.all(
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
    // const authData = await db.admins.authWithPassword(process.env.DB_ADMIN_EMAIL, process.env.DB_ADMIN_PASSWORD)
    // if (!db.authStore.isValid || !db.authStore.isAdmin) {
    //   throw new Error('Invalid Admin Auth')
    // }

    // map setting to meta

    settings.forEach(async (setting) => {
      // set nickname
      const guild = await client.guilds.fetch(setting.guildId)
      const me = await guild.members.fetchMe()
      await me.setNickname(setting.bot.nickname)

      // fetch member
      await guild.members.fetch()

    })

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
        content: "指令出現錯誤",
        ephemeral: true
      }
    )
  }
  console.log(`[/] User ${interaction.user.tag} (${interaction.user.id}) ran ${interaction.commandName} in guild ${interaction.guildId}`);
});

client.login(process.env.TOKEN);