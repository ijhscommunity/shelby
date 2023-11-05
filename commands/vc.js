const {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const { voiceCategoryID } = require("../config.json");
const adj = require("adjectives");
const { one } = require("nouns");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc")
    .setDescription("Creates a temporary voice channel with a random name.")
    .addStringOption((option) =>
      option
        .setName("access")
        .setDescription(
          "The ID of the role or user that should have access to the channel"
        )
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("inactivity")
        .setDescription(
          "Time of inactivity (in minutes) after which the channel should be deleted"
        )
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the voice channel")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.MANAGE_CHANNELS
      )
    ) {
      return await interaction.reply(
        "Sorry, you don't have the necessary permissions to perform this command."
      );
    }

    const accessID = interaction.options.getString("access");
    const inactivityMinutes =
      interaction.options.getInteger("inactivity") || 10;
    const customName = interaction.options.getString("name");

    const channelName =
      customName ||
      `${adj[Math.floor(Math.random() * adj.length)]}-${one()}-${Math.floor(
        Math.random() * 1000
      )}`;

    const permissions = accessID
      ? [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: accessID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.Connect,
            ],
          },
        ]
      : [];

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: voiceCategoryID,
      permissionOverwrites: permissions,
    });

    await interaction.reply(
      `Created a temporary voice channel: ${channelName}`
    );

    const checkActivity = setInterval(async () => {
      if (channel.members.size === 0) {
        clearInterval(checkActivity);
        await channel.delete();
        interaction.followUp({
          content: `Deleted channel due to inactivity.`,
          ephemeral: true,
        });
      }
    }, inactivityMinutes * 60 * 1000);
  },
};
