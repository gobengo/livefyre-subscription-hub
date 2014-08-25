/**
JSON-RPC a tiny, simple specification performing RPC using JSON-RPC messages
over a duplex channel.
http://json-rpc.org/
 */

var Promise = require('promise');

exports.request = request;

function request(publish, subscribe, requestMessage) {
    var reqId = requestMessage.id;
    var promiseOfResponse = new Promise(function (resolve, reject) {
        var subscription = subscribe(onMessage);
        publish(requestMessage);
        function onMessage(message) {
            if (( ! message) || message.id !== reqId) {
                // not a message that is relevant to this req-res
                return;
            }
            if (message.method) {
                // this is a request. Probably the same as was passed here
                return;
            }
            // We got the response!
            subscription.unsubscribe();

            if (message.result) {
                return resolve(message.result);
            }
            if (message.error) {
                return reject(message.error);
            }
        }
    });
    return promiseOfResponse;
};

exports.requestOverStream = function (duplex, requestMessage) {
    var subscribe = function (onMessage) {
        duplex.on('data', onMessage);
        return {
            unsubscribe: function () {
                duplex.removeListener('data', onMessage);
            }
        };
    };
    var publish = function (message) {
        duplex.write(message);
    };
    return request(publish, subscribe, requestMessage);
};

exports.requestOverWindow = function (someWindow, requestMessage) {
    var subscribe = onMessage.bind({}, someWindow);
    var publish = function (message) {
        someWindow.postMessage(message, '*');
    };
    return request(publish, subscribe, requestMessage);
};

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

