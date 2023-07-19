const {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const { voiceCategoryID } = require("../config.json");
const adj = require("adjectives");
const { one } = require("nouns");

// /z command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("z")
    .setDescription("Creates a temporary voice channel with a random name."),

  async execute(interaction) {
    // Ensure the user has appropriate permissions to manage channels
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.MANAGE_CHANNELS
      )
    ) {
      return await interaction.reply(
        "Sorry, you don't have the necessary permissions to perform this command."
      );
    }

    // Generate channel name
    const channelName = `${
      adj[Math.floor(Math.random() * adj.length)]
    }-${one()}-${Math.floor(Math.random() * 1000)}`;

    // Create the channel in the voice channel category
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: voiceCategoryID,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.Connect,
          ],
        },
      ],
    });

    // Confirm channel creation
    await interaction.reply(
      `Created a temporary voice channel: ${channelName}`
    );

    // Delete the channel after 10 minutes of inactivity
    const checkActivity = setInterval(async () => {
      if (channel.members.size === 0) {
        clearInterval(checkActivity);
        await channel.delete();
        // Send an ephemeral message to the user
        interaction.followUp({
          content: `Deleted channel due to inactivity.`,
          ephemeral: true,
        });
      }
    }, 10 * 60 * 1000);
  },
};
