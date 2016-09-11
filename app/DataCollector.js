
'use strict';


var fs = require('fs');
var moment = require('moment');
var _ = require('lodash');

function DataCollector(bot) {
  this._data = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));

  console.log(this.data);
  console.log('////////////////////////////////////////////////');

  this._bot = bot;
  this._version = '1.0.1';
  this._chats = [];
  //
  this.extend = function( o ) {
    for( var i in o ) {
      if( o.hasOwnProperty(i) ) {
        this[i] = o[i];
      }
    }
  }
  //extending
  this.extend(require('./app/servicechat'));
}
//  init
DataCollector.prototype.init = function(chat, typeDoc) {
  var typeDocs = this._data.typeDocs;

  var index = _.findIndex(typeDocs, { 'description': typeDoc});
  if (index > -1) {
    var item = typeDocs[index];
    chat._curTypeDoc = JSON.parse(JSON.stringify(item));
    //!!!
    // chat._curInterviews = item.interview.slice(0);
    chat._curInterviews = chat._curTypeDoc.interview;
    chat._curInterview = chat._curInterviews[0];
  }
}

//  dataProcessing
DataCollector.prototype.dataProcessing = function(msg) {
  var typeDocs = this._data.typeDocs;
  var arrDescription = DataCollector.prototype.getTypeDocs.bind(this)();
  var chat = this.getChat(msg);

  console.log(msg);
  //confirm key command
  if (msg.text === '/start') {
    DataCollector.prototype.stepStart.bind(this)(chat, msg);
    return true;
  } else if (msg.text === 'Все верно, подверждаете?') {
    DataCollector.prototype.doneAnswers.bind(this)(chat);
    DataCollector.prototype.stepCancel.bind(this)(chat, msg);
    return true;
  } else if (msg.text === 'Отмена, вернуться к списку выбора?') {
    DataCollector.prototype.stepCancel.bind(this)(chat, msg);
    return true;
  } else if (msg.text === 'Отмена') {
    DataCollector.prototype.stepCancel.bind(this)(chat, msg);
    return true;
  } else if (msg.text === 'Назад') {
    DataCollector.prototype.stepPrev.bind(this)(chat, msg);
    return true;
  }
  if (!chat._curTypeDoc || arrDescription.indexOf(msg.text) > -1) {
    DataCollector.prototype.init.bind(this)(chat, msg.text);
  }

  DataCollector.prototype.nextItem.bind(this)(chat, msg);
}

//getTypeDocs
DataCollector.prototype.getTypeDocs = function() {
  var typeDocs = this._data.typeDocs;
  var arrTypeDocs = [];
  for (var i = 0; i < 1; i++) {
    typeDocs.forEach(function(item, i, arr){
      arrTypeDocs.push(item.description);
    });
  }
  return arrTypeDocs;
};

DataCollector.prototype.getTypeDocsKeyboard = function() {
  var arrTypeDocs = DataCollector.prototype.getTypeDocs.bind(this)();
  var arrTypeDocsKeyboard = [];
  for (var i = 0; i < 1; i++) {
    arrTypeDocs.forEach(function(item, i, arr){
      arrTypeDocsKeyboard.push([item]);
    });
  }
  return arrTypeDocsKeyboard;
}

//stepStart
DataCollector.prototype.stepStart = function(msg) {
  var opts = {
    reply_markup: JSON.stringify(
      {
        force_reply: true,
        one_time_keyboard: true,
        resize_keyboard: true,
        selective: true,
        keyboard: DataCollector.prototype.getTypeDocsKeyboard.bind(this)()
      }
    )
  };
  this._bot.sendMessage(msg.chat.id, 'Вас приветствует сервис по производству справок разного назначения! \n Выбирайте какую справку нужно оформить?', opts);
}

//stepCancel
DataCollector.prototype.stepCancel = function(chat, msg) {
  chat._curTypeDoc = undefined;  //Object - current type doc example 'Больничный лист'
  chat._curInterviews = undefined;  //Object - current interviews
  chat._curInterview = undefined;  //Object - current interview
  chat._curCount = -1;  //integer - current count interview
  //
  msg.text = '';
  DataCollector.prototype.dataProcessing.bind(this)(msg);
  DataCollector.prototype.stepStart.bind(this)(chat, msg);
}

//stepPrev
DataCollector.prototype.stepPrev = function(chat, msg) {
  chat._curCount -= 2;  //integer - current count interview
  if (chat._curCount < -1) {
    chat._curCount = -1;
  }
  DataCollector.prototype.nextItem.bind(this)(chat, msg);
}

//  getOptKeys
DataCollector.prototype.getOptKeys = function() {
  var optKeys = [['Назад', 'Отмена']];
  return optKeys;
}
//  getKeysOkCancel
DataCollector.prototype.getKeysOkCancel = function() {
  var optKeys = [['Все верно, подверждаете?', 'Отмена, вернуться к списку выбора?']];
  return optKeys;
}

//  nextItem
DataCollector.prototype.nextItem = function(chat, msg) {
  //?
  if (!chat._curTypeDoc || !chat._curTypeDoc.interview || chat._curCount < -1 ){return true}
  DataCollector.prototype.doneAnswer.bind(this)(chat, msg);

  chat._curCount++;
  var interviews = chat._curTypeDoc.interview;
  var curItem = interviews[chat._curCount];

  if (curItem) {
    chat._curInterview = curItem;
    var opts = {
      reply_markup: JSON.stringify(
        {
          force_reply: true,
          resize_keyboard: true,
          keyboard: DataCollector.prototype.getOptKeys()
        }
      )
    };
    this._bot.sendMessage(msg.chat.id, curItem.question, opts);
  } else {
    var opts = {
      reply_markup: JSON.stringify(
        {
          force_reply: true,
          resize_keyboard: true,
          keyboard: DataCollector.prototype.getKeysOkCancel()
        }
      )
    };
    //finish
    // debugger;
    this._bot.sendMessage(msg.chat.id, DataCollector.prototype.makeConfirmationMsg.bind(this)(chat), opts)
  }
}

//  doneAnswers
DataCollector.prototype.doneAnswers = function(chat) {
  DataCollector.prototype.requestURL.bind(this)(chat);
}

//  doneAnswer
DataCollector.prototype.doneAnswer = function(chat, msg) {
  var interview = chat._curInterview;

  if (interview) {
    interview.answer = msg.text;
  }
}

//  makeConfirmationMsg
DataCollector.prototype.makeConfirmationMsg = function(chat) {
  var textMsg = 'Проверьте, все верно? \n';
  textMsg += chat._curInterviews.map(function(elem){
    return '"'+ elem.question + '": ' + elem.answer;
  }).join('\n');
  return textMsg;
}

//  requestURL
DataCollector.prototype.requestURL = function(chat) {

  var request = require("request");
  var options = { method: 'GET',
  url: chat._curTypeDoc.googleURLForm,
  qs: DataCollector.prototype.getQueryData.bind(this)(chat),
  headers:  { 'cache-control': 'no-cache' }
};

request(options, function (error, response, body) {
  if (error)
  {
    console.log('ERROR',error, response);
    throw new Error(error);
  }
  // console.log(body);
});
}

//  getQueryData
DataCollector.prototype.getQueryData = function(chat) {
  var qs = {};
  var fnCreatTextUrl = function(elem, i) {
    if (elem.typeAnswer === 'Date') {
      var dateBorn = moment(elem.answer,'DD.MM.YYYY');
      // "entry":["510197301_year","510197301_month","510197301_day"]
      qs['entry.' + elem.entry[1]] = (dateBorn.month()+1).toString();
      qs['entry.' + elem.entry[0]] = dateBorn.year().toString();
      qs['entry.' + elem.entry[2]] = dateBorn.date().toString();
    } else {
      qs['entry.' + elem.entry] = elem.answer;
    }
  };
  chat._curInterviews.map(fnCreatTextUrl);
  qs.submit = 'Submit';

  return  qs;
}

//  sendMessage
DataCollector.prototype.dataSendMessage = function(msg) {
  var typeDocs = this._data.typeDocs,
  arrDescription = [];
  return arrDescription;
}

//methods:
//  getItem
//  nextItem
//  doneAnswers
//  requestURL
//  sendMessage

module.exports = DataCollector;
