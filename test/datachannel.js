var test = require('tape');
var quickconnect = require('..');
var connections = [];
var dcs = [];
var room = require('uuid').v4();
// var freeice = require('freeice');
// var signallingServer = 'http://rtc.io/switchboard/';
var signallingServer = location.origin;

// require('cog/logger').enable('*');

test('create connector 0', function(t) {
  t.plan(3);
  t.ok(connections[0] = quickconnect(signallingServer, {
    room: room
  }), 'created');

  t.equal(typeof connections[0].createDataChannel, 'function', 'has a createDataChannel function');

  // create the data channel
  connections[0].createDataChannel('test');
  setTimeout(t.pass.bind(t, 'dc created'), 500);
});

test('create connector 1', function(t) {
  t.plan(3);
  t.ok(connections[1] = quickconnect(signallingServer, {
    room: room
  }), 'created');

  t.equal(typeof connections[1].createDataChannel, 'function', 'has a createDataChannel function');

  // create the data channel
  connections[1].createDataChannel('test');
  setTimeout(t.pass.bind(t, 'dc created'), 500);
});

test('check call active', function(t) {
  t.plan(connections.length);
  connections[0].waitForCall(connections[1].id, t.pass.bind(t, 'connected'));
  connections[1].waitForCall(connections[0].id, t.pass.bind(t, 'connected'));
});

test('calls started', function(t) {
  t.plan(connections.length);
  connections.forEach(function(conn) {
    conn.once('call:started', t.pass.bind(t, 'connected'));
  });
});

test('data channels opened', function(t) {
  t.plan(2);
  connections[0].requestChannel(connections[1].id, 'test', function(dc) {
    dcs[0] = dc;
    t.equal(dc.readyState, 'open', 'connection test dc 0 open');
  });

  connections[1].requestChannel(connections[0].id, 'test', function(dc) {
    dcs[1] = dc;
    t.equal(dc.readyState, 'open', 'connection test dc 1 open');
  });
});

test('dc 0 send', function(t) {
  dcs[1].onmessage = function(evt) {
    t.equal(evt.data, 'hi', 'dc:1 received hi');
    dcs[1].onmessage = null;
  };

  t.plan(1);
  dcs[0].send('hi');
});

test('dc 1 send', function(t) {
  dcs[0].onmessage = function(evt) {
    t.equal(evt.data, 'hi', 'dc:1 received hi');
    dcs[0].onmessage = null;
  };

  t.plan(1);
  dcs[1].send('hi');
});

test('release references', function(t) {
  t.plan(1);
  connections.splice(0).forEach(function(conn, index) {
    conn.close();
  });

  dcs = [];
  t.pass('done');
});