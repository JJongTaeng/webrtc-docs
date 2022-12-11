const roomName = 'Room';
const socket = io();
const localVideo = document.querySelector('#localVideo');
const peerVideo = document.querySelector('#peerVideo');
const config = {
  iceServers: [
    {
      urls: ["stun:ntk-turn-1.xirsys.com"],
    },
    {
      username:
        "2tppCJ68KoBGTCmS2j6lQq20PYt-GuP7o1JkdQv92pYuSJxFY_6H4Z1uzBeSdVRZAAAAAGLBgNdqb2ludDE0",
      credential: "558bcc26-fac5-11ec-acaa-0242ac120004",
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

navigator.mediaDevices.getUserMedia({
  audio: false,
  video: true,
}).then(stream => {
  localVideo.srcObject = stream;
  stream.getTracks().forEach(track => {
    console.log('track', track);
    peer.addTrack(track, stream);
  })
});

peer.ontrack = (data) => {
  peerVideo.srcObject = data.streams[0];
}

peer.onicecandidate = (data) => {
  console.log('ice', data);
  if(data.candidate)  socket.emit('ice', data.candidate, roomName);
}

socket.emit('joinRoom', roomName);

socket.on('welcome', async () => {
  console.log('>>> join other user');
  const offer = await peer.createOffer();
  peer.setLocalDescription(offer);
  socket.emit('offer', offer, roomName);
});

socket.on('offer', async (offer) => {
  console.log('>>> offer = ', offer);
  peer.setRemoteDescription(offer);
  const answer = await peer.createAnswer();
  peer.setLocalDescription(answer);
  socket.emit('answer', answer, roomName);
});

socket.on('answer', (answer) => {
  console.log(answer);
  peer.setRemoteDescription(answer);
});

socket.on('ice', ice => {
  console.log('>>> received ice = ', ice);
  peer.addIceCandidate(ice);
})