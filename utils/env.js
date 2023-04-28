// Importing environment variables from .env file
require("dotenv").config();
const { TOKEN, CLIENT_ID, GUILD_ID, COOLDOWN_DURATION } = process.env;

const token = TOKEN;
const clientId = CLIENT_ID;
const guildId = GUILD_ID;
const cooldown_duration = COOLDOWN_DURATION;

module.exports = {
    token,
    clientId,
    guildId,
    cooldown_duration,
}
