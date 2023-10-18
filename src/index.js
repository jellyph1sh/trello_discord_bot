import getLastActionMessage from './trello_api.js';
import config from './config_test.json' assert {type: 'json'};
import { Client, Events, GatewayIntentBits } from 'discord.js';
import embed from './embed.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const sendTrelloLog = (channel) => {
  setInterval(async () => {
    let message = await getLastActionMessage();
    if (message === '') return;
    channel.send({ embeds: [embed('Trello Log', '#e6110e', message, authorName)] });
  }, 1000)
}

client.once(Events.ClientReady, client => {
  console.log(`Bot started! ${client.user.tag}`);
  const channel = client.channels.cache.get(config.channelId)
  sendTrelloLog(channel);
})

client.login(config.discordToken);
