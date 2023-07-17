const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  Events,
  EmbedBuilder,
} = require("discord.js");
const Jimp = require("jimp");
const path = require("path");

// CONSTANTS
const client = require("../utils/client");
const config = require("../config.json");

function toRGB(hex) {
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  let max = Math.max(r, g, b);
  r = r === max ? r * 1.5 : r * 0.7;
  g = g === max ? g * 1.5 : g * 0.7;
  b = b === max ? b * 1.5 : b * 0.7;

  return { r, g, b };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Introduce yourself to everyone in the server!"),
  async execute(interaction) {
    const member = interaction.member;

    if (
      member.roles.cache.some((r) => r.name === config.introduction.roleName)
    ) {
      return interaction.reply({
        content: "You've already introduced yourself!",
        ephemeral: true,
      });
    }

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
      .setPlaceholder("e.g. 15")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const locationInput = new TextInputBuilder()
      .setCustomId("locationInput")
      .setLabel("Where are you from?")
      .setPlaceholder("e.g. Los Angeles")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const nameRow = new ActionRowBuilder().addComponents(nameInput);
    const ageRow = new ActionRowBuilder().addComponents(ageInput);
    const locationRow = new ActionRowBuilder().addComponents(locationInput);

    modal.addComponents(nameRow, ageRow, locationRow);
    await interaction.showModal(modal);
  },
};

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "introModal") {
    const name = interaction.fields.getTextInputValue("nameInput");
    const age = parseInt(interaction.fields.getTextInputValue("ageInput"));
    const location = interaction.fields.getTextInputValue("locationInput");

    const introduction = `${name}, from ${location}, is ${age} years old. Welcome to YALA ${interaction.user}!`;
    let introductionHex = Buffer.from(introduction).toString("hex");

    let colors = [];
    for (let i = 0; i < introductionHex.length; i += 6) {
      let hexColor = introductionHex.slice(i, i + 6).padEnd(6, "0");
      let rgbColor = toRGB(hexColor);
      colors.push(rgbColor);
    }

    const squareSize = 10;

    let img = new Jimp(520, 100, 0xffffffff);

    for (let y = 0; y < img.bitmap.height; y += squareSize) {
      for (let x = 0; x < img.bitmap.width; x += squareSize) {
        let colorIndex =
          ((y / squareSize) * (img.bitmap.width / squareSize) +
            x / squareSize) %
          colors.length;
        let color = colors[colorIndex];

        for (
          let subY = y;
          subY < y + squareSize && subY < img.bitmap.height;
          subY++
        ) {
          for (
            let subX = x;
            subX < x + squareSize && subX < img.bitmap.width;
            subX++
          ) {
            img.setPixelColor(
              Jimp.rgbaToInt(color.r, color.g, color.b, 255),
              subX,
              subY
            );
          }
        }
      }
    }

    let fontPath = path.join(__dirname, "..", "assets", "font", "font.fnt");
    let font = await Jimp.loadFont(fontPath);
    let text = "YALA 2023";
    let textSize = Jimp.measureText(font, text);
    let textHeight = Jimp.measureTextHeight(font, text, img.bitmap.width);

    img.print(
      font,
      img.bitmap.width - textSize - 10,
      img.bitmap.height - textHeight - 5,
      text
    );

    let introductionEmbed = new EmbedBuilder()
      .setTitle(`${name} is ${age} years old from ${location} :wave:`)
      .setDescription(
        `Welcome to YALA 2023! Now that you're introduced, meet the rest of the YALA community at <#${config.loungeID}>. Hope to see you there!`
      )
      .setFooter({
        text: "P.S. You can download the custom image below by right clicking on it!",
      })
      .setColor("#ffd700")
      .setTimestamp();

    const channel = client.channels.cache.get(config.introduction.channelId);
    if (channel) {
      const imageBuffer = await img.getBufferAsync(Jimp.MIME_PNG);

      const introductionMessage = await channel.send({
        embeds: [introductionEmbed],
      });

      await channel.send({
        files: [
          {
            attachment: imageBuffer,
            name: `${name.toLowerCase()}_introduction.png`,
          },
        ],
      });

      // Start a new public thread based on the introductionMessage
      const thread = await introductionMessage.startThread({
        name: `${name}'s Introduction`,
        autoArchiveDuration: 60, // thread auto-archives after 1 hour of inactivity
        reason: "Opened for additional introduction or conversation",
      });

      // Send a follow-up message in the new thread
      await thread.send(
        "If you wanna put anything else, I've opened up a thread for ya!"
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
      content: `You have been introduced and assigned the ${role.name} role!`,
      ephemeral: true,
    });
  }
});
