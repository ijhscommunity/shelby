const axios = require("axios");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { unsplash_api_key } = require("../utils/env");

async function fetchRandomOtterImage() {
  try {
    const response = await axios.get(
      `https://api.unsplash.com/photos/random?query=otter&client_id=${unsplash_api_key}`
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching otter image:", error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("otter")
    .setDescription("Returns a random otter image from the internet!"),

  async execute(interaction) {
    const data = await fetchRandomOtterImage();
    if (!data) return;

    const name = data.user.name || "someone";
    const model = data.exif.model || "an unknown camera";
    const location = data.location.name || "the wild";

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle(`I found an otter in ${location}!`)
      .setURL(data.links.html)
      .setDescription(`Shot by ${name} on ${model}`)
      .setImage(data.urls.regular)
      .setTimestamp(new Date())
      .setFooter({
        text: "Created by cytronicoder#4975",
        iconURL: interaction.user.avatarURL(),
      });

    await interaction.reply({
      embeds: [embed],
    });
  },
};
