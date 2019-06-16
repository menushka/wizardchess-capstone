/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const io = require('socket.io-client');

const socket = io('http://localhost:8000', { query: { client:"alexa" } });

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Wizard Chess!';

    const userId = handlerInput.requestEnvelope.session.user.userId;

    socket.emit('alexaConnection', {
      userId: userId
    });

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('WizardChess', speechText)
      .getResponse();
  },
};

const JoinIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      || handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest')
      && handlerInput.requestEnvelope.request.intent.name === 'JoinIntent';
  },
  handle(handlerInput) {
    const speechText = 'Connected!';

    const userId = handlerInput.requestEnvelope.session.user.userId;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const gameId = slots["GAME_ID"].value;

    socket.emit('joinGame', {
      userId: userId,
      gameId: gameId
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
  handle(handlerInput) {
    const speechText = 'Chess piece moved!';

    const userId = handlerInput.requestEnvelope.session.user.userId;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const chessPiece = slots["CHESS_PIECE"].value;
    const boardPosition = slots["BOARD_POSITION"].value;

    socket.emit('chessPieceMoved', {
      userId: userId,
      chessPiece: chessPiece,
      boardPosition: boardPosition
    });

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Piece Moved', speechText)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speechText = 'Unrecognized command.';

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

const skillBuilder = Alexa.SkillBuilders.custom();

exports.skill = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    JoinIntentHandler,
    MovePieceIntentHandler,
    FallbackIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .create();
