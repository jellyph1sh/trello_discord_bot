import fetch from 'node-fetch';
import fs from 'fs';
import config from './config_test.json' assert {type: 'json'};

const configFilename = './database.json'
let dbData;

const callTrelloAPI = (query) => {
    return new Promise((resolve, reject) => {
        fetch(query, {method: 'GET'})
        .then(response => {
            console.log(`Response: ${response.status}`);
            return resolve(response.json());
        })
        .catch(err => {return reject(err)});
    });
}

const saveConfigFile = () => {
    fs.writeFile(configFilename, JSON.stringify(dbData), (err) => {if (err) throw err});
}

const getMessageByActionType = (response) => {
    const data = response[0];

    let message = '';
    switch (data.type) {
      case 'addAttachmentToCard':
            message = `${data.memberCreator.fullName} a ajouté ${data.data.attachment.name} en pièce jointe à la carte ${data.data.card.name}.`;
            break;
          case 'addChecklistToCard':
            message = `${data.memberCreator.fullName} a ajouté une checklist nommée ${data.data.checklist.name} à la carte ${data.data.card.name}.`;
            break;
          case 'addMemberToBoard':
            message = `${data.memberCreator.fullName} a ajouté un nouveau membre au tableau.`;
            break;
          case 'addMemberToCard':
            message = `${data.memberCreator.fullName} a ajouté ${data.member.fullName} à la carte ${data.data.card.name}.`;
            break;
          case 'commentCard':
            message = `${data.memberCreator.fullName} a ajouté le commentaire : "${data.data.text}" à la carte ${data.data.card.name}.`;
            break;
          case 'createCard':
            message = `${data.memberCreator.fullName} a créé une carte ${data.data.card.name} dans la liste ${data.data.list.name}.`;
            break;
          case 'createList':
            message = `${data.memberCreator.fullName} a créé une liste nommée ${data.data.list.name}.`;
            break;
          case 'deleteCard':
            message = `${data.memberCreator.fullName} a supprimé une carte.`;
            break;
          case 'removeChecklistFromCard':
            message = `${data.memberCreator.fullName} a rétiré la checklist nommée ${data.data.checklist.name} de la carte ${data.data.card.name}.`;
            break;
          case 'removeMemberFromCard':
            message = `${data.memberCreator.fullName} a retiré ${data.member.fullName} de la carte ${data.data.card.name}.`;
            break;
          case 'updateCard':
            message = `${data.memberCreator.fullName} a mis à jour la carte ${data.data.card.name}.`;
            break;
          case 'updateChecklist':
            message = `${data.memberCreator.fullName} a mis à jour la checklist nommée ${data.data.checklist.name} de la carte ${data.data.card.name}.`;
            break;
          case 'updateList':
            message = `${data.memberCreator.fullName} a mis à jour la liste ${data.data.list.name}.`;
            break;
          default:
            return message;
    }

    return message;
}

const GetLastActionMessage = async () => {
    let data = await callTrelloAPI(`https://api.trello.com/1/boards/${config.trelloBoardId}/actions/?key=${config.trelloAPIKey}&token=${config.trelloToken}&limit=1`);
    dbData = fs.readFileSync(configFilename);
    dbData = JSON.parse(dbData);
    if (data[0].id === dbData.lastActionId) return '';
    let message = getMessageByActionType(data);
    dbData.lastActionId = data[0].id;
    saveConfigFile();
    return message;
}

export default GetLastActionMessage;