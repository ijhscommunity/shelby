const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  Events,
} = require("discord.js");

// CONSTANTS
const client = require("../utils/client");
const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Introduce yourself to everyone in the server!"),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("introModal")
      .setTitle("Introduce yourself!");

    const nameInput = new TextInputBuilder()
      .setCustomId("nameInput")
      .setLabel("What is your name?")
      .setPlaceholder("e.g. Shelby")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const ageInput = new TextInputBuilder()
      .setCustomId("ageInput")
      .setLabel("How old are you?")
      .setPlaceholder("Just a number would work")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const locationInput = new TextInputBuilder()
      .setCustomId("locationInput")
      .setLabel("Where are you from?")
      .setPlaceholder("e.g. London, Singapore, etc.")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const likeInput = new TextInputBuilder()
      .setCustomId("likeInput")
      .setLabel("What do you like to do?")
      .setPlaceholder("e.g. play games, watch movies, etc.")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(ageInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(locationInput);
    const fourthActionRow = new ActionRowBuilder().addComponents(likeInput);

    modal.addComponents(
      firstActionRow,
      secondActionRow,
      thirdActionRow,
      fourthActionRow
    );

    await interaction.showModal(modal);
  },
};

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === "introModal") {
    const name = interaction.fields.getTextInputValue("nameInput");
    const age = parseInt(interaction.fields.getTextInputValue("ageInput"));
    const location = interaction.fields.getTextInputValue("locationInput");
    const like = interaction.fields.getTextInputValue("likeInput");

    const channel = client.channels.cache.get(config.introduction.channelId);
    if (channel) {
      await channel.send(
        `${name}, from ${location}, is ${age} years old and likes to ${like}! Welcome to YALA ${interaction.user}!`
      );
    } else {
      console.error("Channel not found for introduction!");
    }

    const role = interaction.guild.roles.cache.find(
      (r) => r.name === config.introduction.roleName
    );
    if (!role) return;

    const member = interaction.member;
    await member.roles.add(role);

    await interaction.reply({
      content: "You have been introduced and assigned the Member role!",
      ephemeral: true,
    });
  }
});
