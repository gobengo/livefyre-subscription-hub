var StreamClient = require('stream-client');
var Readable = require('stream/readable');

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
 * @todo
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
    this.streamClients = [];
}

/**
 * Create a subscription, return a stream of published notifications.
 * @todo - Use stream-client to build these streams
 */
SubscriptionService.prototype.createSubscription = function (opts) {
    log('creating subscription for: '+opts.topic);
    var subscription = new Readable();
    subscription._read = function () {
        // end immediately. No messages for now.
        this.push(null);
    }
}

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
        var topicSubscription = service.createSubscription(message.params)
    }
}

// Return whether a given message object is meant to be a
// subscription request
function isSubscribeRequest(message) {
    return message && message.method && message.method.indexOf('subscribe');
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
