
'use strict';

var Chat = require('./chat.js');
var _ = require('lodash');

function ServiceChat() {}

//addChat
//getChat
//delChat
var getChat = function(msg) {
  //?
  if (!msg) return {};

  var chats = this._chats;
  var chat = {};
  var idChat = _.findIndex(chats, { 'chat': { 'id': msg.chat.id}});
  if (idChat < 0) {
    addChat.bind(this)(msg);
    idChat = _.findIndex(chats, { 'chat': { 'id': msg.chat.id}});;
  }

  return chats[idChat];
};

//addChat
var addChat = function(msg) {
  //?
  if (!msg) return {};

  var chats = this._chats;
  var chat = new Chat();
  chat.chat = msg.chat;
  chats.push(chat);
  // console.log('chats', chats);
};

//delChat
var delChat = function(msg) {
  //?
  if (!msg) return {};

  var chats = this._chats;
  var idChat = _.findIndex(chats, { 'chat': { 'id': msg.chat.id}});
  if (idChat > -1) {
    chats.splice(idChat,1);
  }
};

ServiceChat.getChat = getChat;
ServiceChat.addChat = addChat;
ServiceChat.delChat = delChat;

module.exports = ServiceChat;
