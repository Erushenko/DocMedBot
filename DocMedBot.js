'use strict';


//require TelegramBot
var TelegramBot = require('node-telegram-bot-api');
var DataCollector = require('./app/DataCollector');

var TOKEN = '265307433:AAGzcK0GX6wRm9trhdJm-P61GMeRO3ZJLBg';
// var USER = '62598705';

// var bot = new TelegramBot(TOKEN, {polling: {interval: 100}});
var bot = new TelegramBot(TOKEN, {polling: {}});
// bot.getMe(msg);
// console.log(msg);
//require DataCollector
var dataCollector = new DataCollector(bot);





// bot.sendMessage(USER, 'Some text giving three inline buttons', opts_2).then(function (sended) {
//   console.log('Good \n',sended );
//   // `sended` is the sent message.
// });
// bot.sendMessage(USER, 'Чем мы можем помочь?', opts);

bot.on('callback_query', function(msg){
          // var messageChatId = msg.chat.id;
          // var messageText = msg.text;
          // bot.answerCallbackQuery(messageChatId, 'answerCallbackQuery?');
          console.log('##.01.#####  MSG\n' ,msg);

          // if (messageText === 'Заказать лікарняний ліст') {
          //   // console.log('##.02.#####  MSG лікарняний ліст \n' ,msg);
          //   bot.sendMessage(messageChatId, 'лікарняний ліст');
          // } else if (messageText === 'Заказать медичну довідку') {
          //   // console.log('##.03.#####  MSG медичну довідку \n' ,msg);
          //   bot.sendMessage(messageChatId, 'медичну довідку');
          // }
});
// ?
// var msg = {chat:{id: USER}};
//
// dataCollector.stepStart(msg);

bot.on('text', function(msg){
  // debugger;
  dataCollector.dataProcessing(msg);
          // var messageChatId = msg.chat.id;
          // var messageText = msg.text;
          // bot.answerCallbackQuery(messageChatId, 'answerCallbackQuery?');
          // console.log('##.01.#####  MSG\n' ,msg);

          // if (messageText === 'Заказать лікарняний ліст') {
          //   // console.log('##.02.#####  MSG лікарняний ліст \n' ,msg);
          //   bot.sendMessage(messageChatId, 'лікарняний ліст');
          // } else if (messageText === 'Заказать медичну довідку') {
          //   // console.log('##.03.#####  MSG медичну довідку \n' ,msg);
          //   bot.sendMessage(messageChatId, 'медичну довідку');
          // }
});


var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});
