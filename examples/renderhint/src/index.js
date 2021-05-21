'use strict'

const Prism = require('prismjs');
const Video = require('twilio-video');
const getSnippet = require('../../util/getsnippet');
const getRoomCredentials = require('../../util/getroomcredentials');
const helpers = require('./helpers');
const switchOnOff = helpers.switchOnOff;
const setRenderDimensions = helpers.setRenderDimensions;
const switchOnOffBtn = document.querySelector('button#switchOnOff');
const renderDimensionsOption = document.querySelector('button#renderDimensionsOption');
const videoEl = document.querySelector('video#remotevideo');

(async function(){
  // Load the code snippet.
  const snippet = await getSnippet('./helpers.js');
  const pre = document.querySelector('pre.language-javascript');

  pre.innerHTML = Prism.highlight(snippet, Prism.languages.javascript);

  const logger = Video.Logger.getLogger('twilio-video');
  logger.setLevel('silent');

  // Get the credentials to connect to the Room.
  const credsP1 = await getRoomCredentials();
  const credsP2 = await getRoomCredentials();

  // Create room instance and name for participants to join.
  const roomP1 = await Video.connect(credsP1.token, {
    name: 'my-cool-room',
    bandwidthProfile: {
      video: {
        contentPreferencesMode: 'manual',
        clientTrackSwitchOffControl: 'manual'
      }
    }
  });

  // Create the video track for the Remote Participant
  const videoTrack = await Video.createLocalVideoTrack();

  // Connecting remote participant.
  const roomP2 = await Video.connect(credsP2.token, {
    name: 'my-cool-room',
    bandwidthProfile: {
      video: {
        contentPreferencesMode: 'manual',
        clientTrackSwitchOffControl: 'manual'
      }
    },
    tracks: [ videoTrack ]
  });

  // Attach RemoteVideoTrack
  let remoteVideoTrack;
  roomP1.on('trackSubscribed', track => {
    if(track.kind === 'video') {
      track.attach(videoEl);
      remoteVideoTrack = track;
    }
  });

  // Remote Track Switch On/Off
  switchOnOffBtn.onclick = event => {
    event.preventDefault();
    switchOnOff(remoteVideoTrack, remoteVideoTrack.isSwitchedOff);
    remoteVideoTrack.isSwitchedOff ? switchOnOffBtn.textContent = 'Switch Off' : switchOnOffBtn.textContent = 'Switch On';
  }
}());