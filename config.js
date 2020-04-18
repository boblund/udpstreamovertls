"use strict"

module.exports = {

	// Bi-directional UDP packets with aliceProxy
	bob: {
		addr: "127.0.0.1",
		port: 7000
	},

	// Listener in UDPtunnelClient.js)
	// Bi-directional UDP with Alice and TCP over tunnel
	bobProxy: {
		addr: "127.0.0.1",
		port: 7100,
		webRTCport: 7101,
	},

	// Connected to by aliceProxy and bobProxy
	tunnel: {
		addr: "localhost",
		port: 8000
	},

	// Bi-directional UDP packets with bobProxy
	alice: {
		addr: "127.0.0.1",
		port: 9000
	},

	// Listener in UDPtunnelServer.js)
	// Bi-directional UDP with bob and TCP over tunnel
	aliceProxy: {
		addr: "127.0.0.1",
		port: 9100,
		webRTCport: 9101
	}
}