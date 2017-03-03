BlussTV
============= 
Simple volleyball web frontend for CasparCG and Open Broadcaster Software (OBS)

Let you put a HTML overlay on your stream.

Uses mainly data from poengliga.no

Requirements
--------------
* OBS or CasparCG
* NodeJS

Install
--------------
npm install

Start
--------------
node server.js

Open browser at http://localhost:3000

Software setup
--------------
### CasparCG
CasparCG must allow AMCP-connections on port 5250.
Overlays are added to channel 1 layer 10

### OBS
Use Browser Plugin and add make sure the required cameras/streams have a HTML overlay with the address: http://localhost:3000/obs

