require.config({
  paths: {
    jasmine: 'lib/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'lib/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-jquery': 'lib/jasmine-jquery/lib/jasmine-jquery',
    text: 'lib/requirejs-text/text',
    json: 'lib/requirejs-plugins/src/json',
    base64: 'lib/base64/base64',
    'livefyre-package-attribute': 'lib/livefyre-package-attribute/src/main',
    inherits: 'lib/inherits/inherits',
    rework: 'lib/rework/rework',
    debug: 'lib/debug/debug',
    ajax: 'lib/reqwest/reqwest.min',
    'event-emitter': 'lib/event-emitter/src/event-emitter',
    'events-event-emitter': 'lib/events-event-emitter/src/event-emitter',
    'sockjs-client': 'lib/stream-client/node_modules/sockjs-client/sockjs',
    promise: 'lib/promise'
  },
  packages: [{
    name: "subscription-hub",
    location: "src",
    main: "main"
  },{
    name: "livefyre-bootstrap",
    location: "lib/livefyre-bootstrap"
  },{
    name: "auth",
    location: "lib/auth/src"
  },{
    name: "livefyre-auth",
    location: "lib/livefyre-auth/src"
  },{
    name: "auth-interface",
    location: "lib/auth-interface",
    main: 'index.js'
  },{
    name: "css",
    location: "lib/require-css",
    main: "css"
  },{
    name: "less",
    location: "lib/require-less",
    main: "less"
  },{
    name: "mout",
    location: "lib/mout/src",
    main: "index"
  },{
    name: "stream-client",
    location:"lib/stream-client/src",
    main: "StreamClient"
  },{
    name: "util-extend",
    location: "node_modules/util-extend",
    main: "extend"
  },{
    name: 'stream',
    location: 'lib/stream/src'
  }],
  css: {
    clearFileEachBuild: 'dist/subscription-hub.min.css',
    transformEach: {
      requirejs: 'lib/livefyre-package-attribute/tools/prefix-css-requirejs',
      node: 'lib/livefyre-package-attribute/tools/prefix-css-node'
    }
  },
  less: {
    browserLoad: 'dist/subscription-hub.min',
    modifyVars: {
      '@icon-font-path': "\"http://cdn.livefyre.com/libs/livefyre-bootstrap/v1.3.1/fonts/\""
    },
    relativeUrls: true
  },
  shim: {
    jasmine: {
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    },
    'jasmine-jquery': {
      deps: ['jquery', 'jasmine']
    },
    'sockjs-client': {
      exports: 'SockJS'
    },
    rework: {
      exports: 'rework'
    }
  }
});
