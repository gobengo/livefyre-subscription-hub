# livefyre-subscription-hub

A browser-based service that centralizes the responsibility of data access
for real-time streams of information from Livefyre. There should only
need to be one per page.

It is meant to be interacted with via message passing on a shared bus,
and defaults to window.postMessage for this.

## JSON-RPC Messages

### Subscribe Request

Subscribe to be notified of published updates on a topic.

```
{
  id: 'requestId',
  jsonrpc: '2.0',
  method: 'subscription-hub/subscribe',
  params: {
    topic: topic
  }
}
```
