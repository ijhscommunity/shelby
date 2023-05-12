const { ActivityType } = require("discord.js");

// On ready event
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    client.user.setActivity("with wooden sticks", {
      type: ActivityType.PLAYING,
    });
    console.log(`Logged in as ${client.user.tag}!`);
  },
};
