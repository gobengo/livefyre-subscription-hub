module.exports = MessageStream;

var Duplex = require('stream/readable');
var inherits = require('inherits');

function MessageStream(opts) {
    var self = this;
    this._buffer = [];
    Duplex.apply(this, arguments);

    var eventTarget = opts.eventTarget || window;
    this._eventTarget = eventTarget;
    eventTarget.addEventListener('message', onMessageEvent);

    this.destroy = function () {
        eventTarget.removeEventListener('message', onMessageEvent)
    }

    function onMessageEvent(e) {
        var data = e.data;
        // this comes from nextTick util
        if (data === 'tic!') return;
        self._buffer.push(data);
        // trigger _read
        self.read(0);
    }
}

inherits(MessageStream, Duplex);

MessageStream.prototype._read = function () {
    var nextData = this._buffer.shift();
    var self = this;
    setTimeout(function () {
        if (typeof nextData === 'undefined') {
            return self.push();
        }
        return self.push(nextData);
    });
};

MessageStream.prototype._write = function (chunk, done) {
    debugger;
    this._eventTarget.postMessage(chunk, '*');
    done();
};
