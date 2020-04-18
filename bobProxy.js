"use strict"

const config = require("./config.js");

// Tunnel client - serves alice

const tls = require('tls');
const fs = require('fs');
const tunnelAddr = config.tunnel.addr,
			tunnelPort = config.tunnel.port;

const options = {
  ca: [ fs.readFileSync(tunnelAddr + "-cert.pem") ]
  ,checkServerIdentity: function (host, cert) {  //Necessary if server uses self-signed cert
    return undefined;
  }
  ,rejectUnauthorized: tunnelAddr === "localhost" ? false : true
};

options.rejectUnauthorized = options.ca ? options.rejectUnauthorized : false;

var tunnelSocket = tls.connect(tunnelPort, tunnelAddr, options, () => {
  console.log('client connected',
              tunnelSocket.authorized ? 'authorized' : 'unauthorized');
});

tunnelSocket.setEncoding('binary');

tunnelSocket.on('data', (data) => {
  console.log('bobProxy tunnel data: ' + data.length);
// Uncomment this to do explicit stream writes. Comment out pipe lines below  
  if(aliceStream) aliceStream.write(new Buffer(data,'binary'));
});

tunnelSocket.on('end', () => {
  console.log('Ended')
});

// bobProxy

var udp = require('datagram-stream')
    , aliceStream = null
    , net = require('net')
    , bobProxyData = null;

const bobProxyRTCServer = net.createServer((c) => {
  // 'connection' listener.
  console.log('bobProxyRTCServer client connected');

  c.on('end', () => {
    console.log('bobProxyRTCServer client disconnected');
  });

  c.on("data", (data) => {
    console.log("bobProxy data from WebRTC: " + data);
    bobProxyData = JSON.parse(data);

    aliceStream = udp({
      address     : bobProxyData.proxy.ip     //address to bind to
      , unicast   : bobProxyData.client.ip    //unicast ip address to send to
      , port      : bobProxyData.client.port  //udp port to send to
      , bindingPort : bobProxyData.proxy.port //udp port to listen on. Default: port
      , reuseAddr : true        //boolean: allow multiple processes to bind to the
                                //         same address and port. Default: true
    });
    
    aliceStream.on('data', data => {
      console.log('aliceStream data - ' + data.length);
      tunnelSocket.write(data);  // Uncomment this to do explicit tunnel writes. Comment out  following pipe lines   
    });
    // Uncomment following to pipe stream to tunnel. Comment out tunnel and stream writes
    //aliceStream.pipe(tunnelSocket);
    //tunnelSocket.pipe(aliceStream);
  })

});

bobProxyRTCServer.on('error', (err) => {
  throw err;
});

bobProxyRTCServer.listen(config.bobProxy.webRTCport, () => {
  console.log('bobProxyRTCserver bound');
});

