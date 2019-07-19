/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Config = require('../back-end/dist/config');
const os = require("os");

const Alexa = require('ask-sdk-core');
const io = require('socket.io-client');

const ALEXA_CONNECTION = "alexaConnection";
const START_GAME = "startGame";
const JOIN_GAME = "joinGame";
const CHESS_PIECE_MOVED = "chessPieceMove";
const SURRENDER_GAME = "surrenderGame";

const RESPONSE_TIMEOUT = 1000;

class SocketManager {
  constructor() {
    this.socket = io('http://' + os.hostname() + ':' + Config.Config.PORT, { query: { client:"alexa" } });
  }

  emit(userId, eventName, data) {
    return new Promise((resolve, reject) => {
      data.userId = userId;
      const onConfirm = (response) => {
        this.socket.off(eventName + "Confirm", onConfirm);
        if ('error' in response) {
          reject(response);
        }
        resolve(response);
      };
      this.socket.on(eventName + "Confirm", onConfirm);
      this.socket.emit(eventName, data);
      setTimeout(reject, RESPONSE_TIMEOUT);
    });
  }
}

const socketManager = new SocketManager();

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const userId = handlerInput.requestEnvelope.session.user.userId;

    let speechText = '';
    await socketManager.emit(userId, ALEXA_CONNECTION, {})
    .then(() => {
      speechText = appendBreak('Welcome to Wizard Chess!');
    })
    .catch(() => {
      speechText = appendBreak('Error connecting.');
    });

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('WizardChess', speechText)
      .getResponse();
  },
};

const StartGameIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      || handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest')
      && handlerInput.requestEnvelope.request.intent.name === 'StartGameIntent';
  },
  async handle(handlerInput) {
    const userId = handlerInput.requestEnvelope.session.user.userId;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const type = slots["TYPE"].value;

    let speechText = '';
    await socketManager.emit(userId, START_GAME, {
      type: type
    })
    .then((data) => {
      speechText = appendBreak('Game started! Your game code is <say-as interpret-as="digits">' + data.gameId + "</say-as>.");
    })
    .catch(() => {
      speechText = appendBreak('Error starting game.');
    });

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Connected', speechText)
      .getResponse();
  },
};

const JoinGameIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      || handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest')
      && handlerInput.requestEnvelope.request.intent.name === 'JoinGameIntent';
  },
  async handle(handlerInput) {
    const userId = handlerInput.requestEnvelope.session.user.userId;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const gameId = slots["GAME_ID"].value;

    let speechText = '';
    await socketManager.emit(userId, JOIN_GAME, {
      gameId: gameId
    })
    .then(() => {
      speechText = appendBreak('Connected!');
    })
    .catch(() => {
      speechText = appendBreak('Error joining game.');
    });

    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Connected', speechText)
      .getResponse();
  },
};

const MovePieceIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      || handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest')
      && handlerInput.requestEnvelope.request.intent.name === 'MovePieceIntent';
  },
  async handle(handlerInput) {
    const userId = handlerInput.requestEnvelope.session.user.userId;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const boardPositionFrom = slots["BOARD_POSITION_FROM"].value;
    const boardPositionTo = slots["BOARD_POSITION_TO"].value;

    let speechText = '';
    await socketManager.emit(userId, CHESS_PIECE_MOVED, {
      piece: null,
      location: {
        from: boardPositionFrom,
        to: boardPositionTo
      }
    })
    .then(() => {
      speechText = appendBreak('Piece moved!');
    })
    .catch(() => {
      speechText = appendBreak('Error moving piece.');
    });

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Piece Moved', speechText)
      .getResponse();
  },
};

const SurrenderIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      || handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest')
      && handlerInput.requestEnvelope.request.intent.name === 'SurrenderIntent';
  },
  async handle(handlerInput) {
    const userId = handlerInput.requestEnvelope.session.user.userId;

    let speechText = '';
    await socketManager.emit(userId, SURRENDER_GAME, {})
    .then(() => {
      speechText = appendBreak('Game surrendered.');
    })
    .catch(() => {
      speechText = appendBreak('Error surrendering.');
    });

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Connected', speechText)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speechText = appendBreak('Unrecognized command.');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('WizardChess', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('WizardChess', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function appendBreak(str) {
  return str + '<break time="10s"/><break time="10s"/><break time="10s"/><break time="10s"/><break time="10s"/><break time="10s"/>'
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.skill = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    StartGameIntentHandler,
    JoinGameIntentHandler,
    MovePieceIntentHandler,
    SurrenderIntentHandler,
    FallbackIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .create();
