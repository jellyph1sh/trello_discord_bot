const configFilename = './config_test.json'

import fetch from 'node-fetch';
import fs from 'fs';
import config from configFilename assert {type: 'json'};
import { Client, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, client => {
  console.log(`Bot started! ${client.user.tag}`);
  const channel = client.channels.cache.get(config.channelId)
  setInterval(async () => {
    getLastAction(channel);
  }, 1000)
})

client.login(config.discordToken);

const getLastAction = (channel) => {
  fetch(`https://api.trello.com/1/boards/${config.trelloBoardId}/actions/?key=${config.trelloAPIKey}&token=${config.trelloToken}&limit=1`, {
    method: 'GET'
  })
  .then(response => {
    console.log(`Response: ${response.status} ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    fs.readFile(configFilename, (err, configData) => {
      if (err) return console.error(err);
      const configJSON = JSON.parse(configData);
      if (configJSON.lastActionId == data[0].id) return;
      let message = '';
      switch (data[0].type) {
        case 'addAttachmentToCard':
          message = `${data[0].memberCreator.fullName} a ajouté ${data[0].data.attachment.name} en pièce jointe à la carte ${data[0].data.card.name}.`;
          break;
        case 'addChecklistToCard':
          message = `${data[0].memberCreator.fullName} a ajouté une checklist nommée ${data[0].data.checklist.name} à la carte ${data[0].data.card.name}.`;
          break;
        case 'addMemberToBoard':
          message = `${data[0].memberCreator.fullName} a ajouté un nouveau membre au tableau.`;
          break;
        case 'addMemberToCard':
          message = `${data[0].memberCreator.fullName} a ajouté ${data[0].member.fullName} à la carte ${data[0].data.card.name}.`;
          break;
        case 'commentCard':
          message = `${data[0].memberCreator.fullName} a ajouté le commentaire : "${data[0].data.text}" à la carte ${data[0].data.card.name}.`;
          break;
        case 'createCard':
          message = `${data[0].memberCreator.fullName} a créé une carte ${data[0].data.card.name} dans la liste ${data[0].data.list.name}.`;
          break;
        case 'createList':
          message = `${data[0].memberCreator.fullName} a créé une liste nommée ${data[0].data.list.name}.`;
          break;
        case 'deleteCard':
          message = `${data[0].memberCreator.fullName} a supprimé une carte.`;
          break;
        case 'removeChecklistFromCard':
          message = `${data[0].memberCreator.fullName} a rétiré la checklist nommée ${data[0].data.checklist.name} de la carte ${data[0].data.card.name}.`;
          break;
        case 'removeMemberFromCard':
          message = `${data[0].memberCreator.fullName} a retiré ${data[0].member.fullName} de la carte ${data[0].data.card.name}.`;
          break;
        case 'updateCard':
          message = `${data[0].memberCreator.fullName} a mis à jour la carte ${data[0].data.card.name}.`;
          break;
        case 'updateChecklist':
          message = `${data[0].memberCreator.fullName} a mis à jour la checklist nommée ${data[0].data.checklist.name} de la carte ${data[0].data.card.name}.`;
          break;
        case 'updateList':
          message = `${data[0].memberCreator.fullName} a mis à jour la liste ${data[0].data.list.name}.`;
          break;
        default:
          return;
      }
      console.log(message);
      channel.send(message);
      config.lastActionId = data[0].id
      fs.writeFile(configFilename, JSON.stringify(config), (err) => {if (err) throw err});
    })
  })
  .catch(err => console.error(err));
}