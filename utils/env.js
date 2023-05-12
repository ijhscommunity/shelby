// Importing environment variables from .env file
require("dotenv").config();
const { TOKEN, CLIENT_ID, GUILD_ID, COOLDOWN_DURATION, UNSPLASH_API_KEY } =
  process.env;

const token = TOKEN;
const clientId = CLIENT_ID;
const guildId = GUILD_ID;
const cooldown_duration = COOLDOWN_DURATION;
const unsplash_api_key = UNSPLASH_API_KEY;

module.exports = {
  token,
  clientId,
  guildId,
  cooldown_duration,
  unsplash_api_key,
};
