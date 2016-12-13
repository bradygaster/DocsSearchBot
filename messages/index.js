"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var docs = require('./docs');

var useEmulator = (process.env.NODE_ENV == 'development');
var shn = process.env['DocsSearchApiUrl'];

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId']
    ,appPassword: process.env['MicrosoftAppPassword']
    ,stateEndpoint: process.env['BotStateEndpoint']
    ,openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
    if (session.message.text == 'help' || session.message.text == 'hi') {
        session.beginDialog('/fre');
    }
    else {
        session.beginDialog('/search');
    }

    session.endDialog();
});

bot.dialog('/search', function (session) {
    docs.searchDocs(session.message.text)
        .then((result) => {
            docs.createReplyFromResults(result.results, result.searched)
                .then((reply) => {
                    session.send(reply);
                });
        });
});

bot.dialog('/fre', function (session) {
    session.send('Welcome to the docs.microsoft.com search bot. Simply type in a search term (\'ASP.NET\', \'StringBuilder\', or \'IPrincipal\', for example), and I\'ll find you relevant links from our documentation.');
});


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
