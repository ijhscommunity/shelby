const { SlashCommandBuilder, EmbedBuilder, inlineCode } = require("discord.js");
const client = require("../utils/client");

// Help command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Provides a list of commands that can be used with the bot."
    ),

  async execute(interaction) {
    const commands = client.commands
      .map((command) => {
        return {
          name: command.data.name,
          description: command.data.description,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("Commands")
      .addFields(
        commands.map((command) => {
          return {
            name: command.name,
            value:
              command.description +
              `\nUsage: ${inlineCode("/" + command.name)}`,
            inline: true,
          };
        })
      )
      .setTimestamp(new Date())
      .setFooter({
        text: "Created by cytronicoder#4975",
        iconURL: client.user.avatarURL(),
      });

    await interaction.reply({
      content:
        "Hey! I'm Shelby, the otter that's helping out with YALA! Here's a list of commands that you can use:",
      embeds: [embed],
    });
  },
};
