import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export default interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}