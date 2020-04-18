"use strict"

const config = require("./config.js");

// tunnel server - serves bob

const tls = require('tls');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),

  rejectUnauthorized: true
};

var tunnelSocket = null;
const server = tls.createServer(options, (socket) => {
	tunnelSocket = socket;
  console.log('server connected',
              socket.authorized ? 'authorized' : 'unauthorized');
  var peerCert = socket.getPeerCertificate(true);

  socket.setEncoding('binary');


	socket.on('data', (data) => {
    console.log('aliceProxy tunnel data: ' + data.length);
    // Uncomment this to do explicit stream writes. Comment out pipe lines below
    if(bobStream) bobStream.write(new Buffer(data,'binary'));
  });
});

server.listen(config.tunnel.port, () => {
  console.log('tunnel server bound');
});

// aliceProxy server for socket from WebRTC server
var udp = require('datagram-stream')
    , net = require('net')
    , aliceProxyData = null
    , bobStream = null;

const aliceProxyRTCServer = net.createServer((c) => {
  console.log('aliceProxyRTCServer client connected');

  c.on('end', () => {
    console.log('aliceProxyRTCServer client disconnected');
  });

  c.on("data", (data) => {
    console.log("aliceProxy data from WebRTC: " + data);
    aliceProxyData = JSON.parse(data);

    bobStream = udp({
      address     : aliceProxyData.proxy.ip     //address to bind to
      , unicast   : aliceProxyData.client.ip    //unicast ip address to send to
      , port      : aliceProxyData.client.port  //udp port to send to
      , bindingPort : aliceProxyData.proxy.port //udp port to listen on. Default: port
      , reuseAddr : true        //boolean: allow multiple processes to bind to the
                                //         same address and port. Default: true
    });
    bobStream.on('data', data => {
      console.log('bobStream data - ' + data.length);
      tunnelSocket.write(data); // Uncomment this to do explicit tunnel writes. Comment out  following pipe lines
    });
    //bobStream.pipe(tunnelSocket);
    //tunnelSocket.pipe(bobStream);
  })

});

aliceProxyRTCServer.on('error', (err) => {
  throw err;
});

aliceProxyRTCServer.listen(config.aliceProxy.webRTCport, () => {
  console.log('aliceProxyRTCServer bound');
});