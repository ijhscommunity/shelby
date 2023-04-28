const fs = require("fs");
const path = require("path");

const { REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require("./utils/env");

const rest = new REST({ version: "9" }).setToken(token);

const commands = [];

// Push all commands to array
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

// Register all commands
(async () => {
    try {
        console.log("[DEPLOY] Started refreshing application (/) commands...");
        await rest.put(
            Routes.applicationCommands(clientId, guildId),
            { body: commands },
        );
        console.log("[DEPLOY] Successfully refreshed application (/) commands!");

        // print out all commands
        console.log("\n[DEPLOY] Registered commands:");
        commands.forEach(command => {
            console.log(`[COMMAND] - ${command.name}`);

            // A complete log of the command, its subcommands and their respective options
            if (command.options) {
                command.options.forEach(option => {
                    switch (option.type) {
                        case 1:
                            console.log(`    [SUBCOMMAND] - ${option.name}`);
                            if (option.options) {
                                option.options.forEach(option => {
                                    console.log(`            [OPTION] - ${option.name}`);
                                });
                            }
                            break;
                        default:
                            console.log(`    [OPTION] - ${option.name}`);
                            break;
                    }
                });
            }
        });

    } catch (error) {
        console.error(error);
    }
})();