import { env } from "../../../env";

const roomName = 'Room';
const socket = io();
const localVideo = document.querySelector('#localVideo');
const peerVideo = document.querySelector('#peerVideo');
const button = document.querySelector('button');

const config = {
  iceServers: [
    {
      urls: ["stun:ntk-turn-1.xirsys.com"],
    },
    {
      username: env.username,
      credential: env.credential,
      urls: [
        "turn:ntk-turn-1.xirsys.com:80?transport=udp",
        "turn:ntk-turn-1.xirsys.com:3478?transport=udp",
        "turn:ntk-turn-1.xirsys.com:80?transport=tcp",
        "turn:ntk-turn-1.xirsys.com:3478?transport=tcp",
        "turns:ntk-turn-1.xirsys.com:443?transport=tcp",
        "turns:ntk-turn-1.xirsys.com:5349?transport=tcp",
      ],
    },
  ],
};
const peer = new RTCPeerConnection(config);
let dataChannel;

// navigator.mediaDevices.getUserMedia({
//   audio: false,
//   video: true,
// }).then(stream => {
//   localVideo.srcObject = stream;
//   stream.getTracks().forEach(track => {
//     console.log('track', track);
//     peer.addTrack(track, stream);
//   })
// });
//
// peer.ontrack = (data) => {
//   peerVideo.srcObject = data.streams[0];
// }

peer.onicecandidate = (data) => {
  console.log(4, 'send ice')
  if(data.candidate) socket.emit('ice', data.candidate, roomName);
}

peer.ondatachannel = (event) => {
  dataChannel = event.channel;
  event.channel.onmessage = (message) => {
    console.log(message);
  }
}

socket.emit('joinRoom', { roomName });

button.onclick = () => dataChannel.send(JSON.stringify({ value: 'hello' }));

socket.on('welcome', async () => {
  console.log(1, 'welcome');
  dataChannel = peer.createDataChannel(new Date().getTime().toString());
  dataChannel.onopen = () => {
    console.log('datachannel opened')
  }
  dataChannel.onmessage = (message) => {
    console.log('datachannel message = ', message);
  }
  const offer = await peer.createOffer();
  peer.setLocalDescription({ offer });
  socket.emit('offer', { offer, roomName });
});

socket.on('offer', async ({ sdp }) => {
  console.log(2, 'offer', sdp);

  peer.setRemoteDescription(sdp);
  const answer = await peer.createAnswer();
  peer.setLocalDescription(answer);
  socket.emit('answer', { answer, roomName });
});

socket.on('answer', ({ sdp }) => {
  console.log(3, 'answer', sdp);
  peer.setRemoteDescription(sdp );
});

socket.on('ice', ({ ice }) => {
  console.log(5, 'received ice');
  peer.addIceCandidate({ ice });
})