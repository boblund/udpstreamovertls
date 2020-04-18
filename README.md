# Simple example demonstrating WebRTC textchat over a TLS tunnel using UDP streams.

## Overview

```
alice client.html <--- UDP ---> bobProxy <=== TLS socket ===> aliceProxy <--- UDP ---> bob client.html
        |                               \                    /                              |
        |                                \ UDP              / UDP                           |
        |                                 \                /                                |
        |                                  \              /                                 |
        |                                   \            /                                  |
        --------------- websocket ----------- server.js --------------- websocket -----------
```
## Usage

config.js is set up for running all components on 'localhost'

Start in the following order:

```
node aliceProxy.js
node bobProxy.js
node server.js
open (or browser 'open file') client.html; login as alice
open (or browser 'open file') client.html; login as bob
```
