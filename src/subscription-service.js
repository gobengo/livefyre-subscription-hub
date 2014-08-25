var StreamClient = require('stream-client');
var Readable = require('stream/readable');
var guid = require('./guid');

/**
 * SubscriptionService centralizes the responsibility of data access
 * for real-time streams of information from Livefyre. There should only
 * need to be one per page.
 * 
 * It is meant to be interacted with via message passing on a shared bus,
 * and defaults to window.postMessage for this.
 *
 * ## JSON-RPC
 *
 * ### Subscribe Request
 * Subscribe to be notified of published updates on a topic.
 * {
 *   id: 'requestId',
 *   jsonrpc: '2.0',
 *   method: 'subscription-hub/subscribe',
 *   params: {
 *     topic: topic
 *   }
 * }
 * 
 * Response indicates that the subscription was successful.
 * {
 *   id: 'requestId',
 *   jsonrpc: '2.0',
 *   result: 200
 * }
 */
module.exports = SubscriptionService;

/**
 * @param [eventTarget] {object} EventTarget. Defaults to window.
 */
function SubscriptionService(opts) {
    opts = opts || {};
    var eventTarget = opts.eventTarget || window;
    var messageSubscription = onMessage(eventTarget, createMessageHandler(this));
    log('listening for messages')
    // Have 0 or 1 streamClients per Livefyre environment.
    // This hub can subscribe to all the things.
    this._streamClientsByEnvironment = {};
}

/**
 * Create a subscription, return a stream of published notifications.
 * @todo - Use stream-client to build these streams
 */
SubscriptionService.prototype.createSubscription = function (opts) {
    var opts = Object.create(opts || {});
    var streamClient = this._getOrCreateStreamClient(opts.environment);
    log('creating subscription',opts);
    var subscriptionStream = streamClient.subscribe(opts.topic);
    return subscriptionStream;
};

/**
 * Get an appropriate stream-client for an environment, or create
 * one if needed
 */
SubscriptionService.prototype._getOrCreateStreamClient = function (environment) {
    var environment = environment || 'qa';
    var streamClient = this._streamClientsByEnvironment[environment];
    if ( ! streamClient) {
        // First time this env has been subscribed to. Better create.
        this._streamClientsByEnvironment[environment] = streamClient = this._createStreamClient({
            environment: environment
        });
    }
    return streamClient;
};

/**
 * Create a stream client
 */
SubscriptionService.prototype._createStreamClient = function (opts) {
    opts = Object.create(opts || {});
    opts.debug = true;
    opts.hostname = 'stream4.qa.livefyre.com';
    var streamClient = new StreamClient(opts);
    streamClient
        .on('start', function () {
            log('streamClient start', this);
        })
        .on('end', function () {
            log('streamClient end', this);
        })
        .on('error', function (e) {
            log('streamClient error', e, this);
        })
    return streamClient;
};

/**
 * Given a service, return a function that can be invoked with any message,
 * and the service will be orchestrated according to the messaging
 * contract
 * @todo - This is logically separate from the Service. Move?
 *   In that world, the service would not need to listen on a bus directly.
 */
function createMessageHandler(service) {
    return function (message) {
        if ( ! isSubscribeRequest(message)) {
            log('got message that was not subscribe', message);
            return;
        }
        log('got subscribe request', message);
        var topic = message.params.topic;
        var topicSubscription = service.createSubscription(message.params);
        var subscriptionId = guid();
        window.postMessage({
            id: message.id,
            jsonrpc: '2.0',
            result: {
                code: 200,
                subscription: subscriptionId
            }
        }, '*');
        topicSubscription.on('data', function (message) {
            window.postMessage({
                method: subscriptionId,
                params: message
            }, '*');
        });
    }
}

// Return whether a given message object is meant to be a
// subscription request
function isSubscribeRequest(message) {
    return message && message.method && message.method.indexOf('subscribe') !== -1;
}

/**
 * Listen for message events on an eventTarget, and pass
 * the messages to callback
 * @returns a subscription with .unsubscribe()
 */
function onMessage(eventTarget, callback) {
    var eventName = 'message';
    eventTarget.addEventListener(eventName, eventHandler);
    function eventHandler(event) {
        var data = event.data;
        callback(data);
    }
    return {
        unsubscribe: function () {
            eventTarget.removeEventListener(eventName, eventHandler);
        }
    }
}

/**
 * Console.log prefixed by SubscriptionService
 */
function log() {
    console.log.apply(console, ['SubscriptionService:'].concat([].slice.call(arguments)));
}
