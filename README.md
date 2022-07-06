# WebRTC

## 목차
1. [WebRTC 소개](#WebRTC-소개)
2. [WebRTC API](#WebRTC-API)

# WebRTC 소개
- 중개자 없이 브라우저 간에 임의의 데이터를 교환할 수 있도록 하는 기술입니다.
- 오디오 및/또는 비디오 미디어 또한 교환할 수 있습니다.
- WebRTC를 구성하는 일련의 표준들은 플러그인이나 제 3자 소프트웨어 설치 없이 종단 간 데이터 공유와 화상 회의를 가능하게 합니다.

# 비디오, 오디오 데이터 교환 예제
![webrtc-interface](./WebRTC-Interface.drawio.png)
- 위 이미지 처럼 Signaling Server를 통해 각 설정 정보를 주고 받아서 연결을 시도합니다.
- 연결 완료 이후에는 peer-to-peer 통신이 가능합니다.
- 첫번째로 자신의 stream 정보를 호출합니다. (`mediaDevices`는 크롬에서 https에서만 지원됩니다.)
    ```typescript
      const myStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true});
    ```
- 연결정보를 생성합니다.
    ```typescript
      const myPeerConnection = new RTCPeerConnection();
    ```
- offer를 생성하고, localDescription을 설정 후 Signaling Server로 전달합니다.
    ```typescript
      const offer = await myPeerConnection.createOffer();
      myPeerConnection.setLocalDescription(offer);
      // offer 서버로 전송..
    ```
- 서버에서는 다른 Peer 브라우저 B에게 `offer`를 전송합니다.
- 브라우저 B또한 A와 같이 `myStream`과 `myPeerConnection`을 생성했습니다.
- 브라우저 B는 `offer` 데이터를 받아서 `remoteDescription`을 설정해줍니다. 또 `answer`을 생성해서 `localDescription`에 설정하고, 브라우저 A에게 `answer`을 전달합니다. 
    ```typescript
      myPeerConnection.setRemoteDescription(offer);
      const answer = await myPeerConnection.createAnswer();
      myPeerConnection.setLocalDescription(answer);
      // answer 서버로 전송
    ```
- answer을 받은 브라우저 A는 `remoteDescription`에 `answer`을 설정합니다.
    ```typescript
      myPeerConnection.setRemoteDescription(answer);
    ```
- 상호 offer, answer을 주고받은 브라우저는 icecandidate 이벤트가 발생합니다.
- 일반적으로 로컬에서 RTCPeerConnection.setLocalDescription()을 호출한 후에 발생합니다. 몇가지 이벤트 또한 발생합니다.
- RTCPeerConnection을 생성할 때 icecandidate 이벤트를 등록하여, 발생된 ice 값을 상호 브라우저에게 전달하여 addICECandidate()로 설정합니다.
    ```typescript
      function makeConnection() { // makeConnection은 모든 브라우저에서 호출
        myPeerConnection = new RTCPeerConnection();
        myPeerConnection.addEventListener('icecandidate', (data) => {
          // data.candidate 값을 상호 브라우저에게 전송
        });
      }
  
      // 데이터 수신
      myPeerConnection.addIceCandidate(ice);
    ```
- `track` 이벤트를 추가하여, 다른 브라우저의 stream 정보를 받아올 수 있습니다.
- 새로운 인바운드 트랙이 연결에 추가되고 addTrack을 호출하면 트랙 이벤트를 수신합니다. 실제로 확인 시에는 `remoteDescription`에 `answer` 또는 `offer`를 설정할 때 발생합니다.
- track event는 `offer`, `answer`에 오디오와 비디오 두개의 track이 설정되면 각각의 track을 이벤트 콜백의 인자로 받습니다.
    ```typescript
        function makeConnection() { // makeConnection은 모든 브라우저에서 호출
          myPeerConnection = new RTCPeerConnection();
          myPeerConnection.addEventListener('track', (track) => {
            const video = document.createElement("video");
            video.srcObject = track.streams[0];
          });
          myStream.getTracks().forEach(track => {
            myPeerConnection.addTrack(track, myStream)
          });
        } 
    ```
- 여기까지 오면 상대방의 stream과 나의 stream을 브라우저에서 확인할 수 있습니다.

---
**WebRTC API**

# RTCPeerConnection
- RTCPeerConnection 인터페이스는 로컬 컴퓨터와 원격 피어 간의 WebRTC 연결을 나타냅니다.
- 원격 피어에 연결하고, 연결을 유지 및 모니터링하고, 더 이상 필요하지 않으면 연결을 닫는 방법을 제공합니다.

## Constructor
### RTCPeerConnection()
- RTCPeerConnection() 생성자는 로컬 장치와 원격 피어 간의 연결을 나타내는 새로 생성된 RTCPeerConnection을 반환합니다.
- 파라미터로 옵션 값을 전달할 수 있습니다.
```typescript
new RTCPeerConnection();

type RTCBundlePolicy = "balanced" | "max-bundle" | "max-compat";

interface RTCCertificate {
  readonly expires: DOMTimeStamp;
  getFingerprints(): RTCDtlsFingerprint[];
}

interface RTCIceServer {
  credential?: string;
  credentialType?: RTCIceCredentialType;
  urls: string | string[];
  username?: string;
}
type RTCIceTransportPolicy = "all" | "relay";

type RTCRtcpMuxPolicy = "require";

interface RTCConfiguration {
  /*
    원격 피어가 SDP BUNDLE 표준과 호환되지 않을 때 후보 협상을 처리하는 방법을 지정합니다.
   */
  bundlePolicy?: RTCBundlePolicy;
  /*
    인증을 위해 연결에 사용되는 RTCCertificate 유형의 객체 배열
    이 속성을 지정하지 않으면 각 RTCPeerConnection 인스턴스에 대해 인증서 집합이 자동으로 생성됩니다.
    주어진 연결에서 하나의 인증서만 사용되지만 여러 알고리즘에 대한 인증서를 제공하면 일부 상황에서 성공적으로 연결할 확률이 향상될 수 있습니다.
   */
  certificates?: RTCCertificate[];
  /*
    기본값은 0
    연결을 시도하기 전에 ICE 에이전트가 ICE 후보 가져오기를 시작하도록 허용하여 연결을 더 빠르게 설정할 수 있는 경우가 있습니다.
    RTCPeerConnection.setLocalDescription()이 호출될 때 이미 검사에 사용할 수 있도록 합니다.
   */
  iceCandidatePoolSize?: number;
  /*
    ICE 에이전트가 사용할 수 있는 하나의 서버를 각각 설명하는 RTCIceServer 개체의 배열입니다. 이들은 일반적으로 STUN 및/또는 TURN 서버입니다.
    이것이 지정되지 않으면 사용 가능한 STUN 또는 TURN 서버가 없는 상태에서 연결을 시도하여 로컬 피어로의 연결을 제한합니다.
   */
  iceServers?: RTCIceServer[];
  /*
    현재 ICE 운송 정책; 정책이 지정되지 않은 경우 기본적으로 모두가 가정되어 모든 후보가 고려될 수 있습니다. 가능한 값은 다음과 같습니다.
    all: 모든 ICE 후보자가 고려됩니다.
    relay: STUN 또는 TURN 서버를 통해 전달되는 것과 같이 IP 주소가 릴레이되는 ICE 후보만 고려됩니다.
   */
  iceTransportPolicy?: RTCIceTransportPolicy;
  /*
    다중화되지 않은 RTCP를 지원하기 위해 ICE 후보를 수집할 때 사용할 RTCP mux 정책입니다. 가능한 값은 다음과 같습니다.
    negotiate
    require
   */
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

const configuration: RTCConfiguration;

new RTCPeerConnection(configuration)
```

## Properties

### canTrickleIceCandidates
- 읽기 전용 RTCPeerConnection 속성 canTrickleIceCandidates는 원격 피어가 Trickled ICE 후보를 수락할 수 있는지 여부를 나타내는 부울 값을 반환합니다.
- ICE trickling 은 초기 offer나 answer 가 이미 다른 피어에게 전송된 후 candidates를 계속 보내는 프로세스입니다.
- 이 프로퍼티는 RTCPeerConnection.setRemoteDescription()을 호출한 후에만 설정됩니다.
- 이상적으로는 `signaling protocol`이 trickling 지원을 감지하는 방법을 제공하므로 이 프로퍼티에 의존할 필요가 없습니다.
- 

### connectionState
### currentLocalDescription
### currentRemoteDescription
### iceConnectionState
### iceGatheringState
### localDescription
### peerIdentity
### pendingLocalDescription
### pendingRemoteDescription
### remoteDescription
### sctp
### signalingState

## Method
### addIceCandidate()
### addTrack()
### addTransceiver()
### close()
### createAnswer()
### createDataChannel()
### createOffer()
### generateCertificate() static function
### getConfiguration()
### getIdentityAssertion()
### getReceivers()
### getSenders()
### getStats()
### removeTrack()
### restartIce()
### setConfiguration()
### setIdentityProvider()
### setLocalDescription()
### setRemoteDescription()

## Events
### connectionstatechange
### datachannel
### icecandidate
### icecandidateerror
### iceconnectionstatechange
### icegatheringstatechange
### negotiationneeded
### signalingstatechange
### track

# WebRTC Protocol
## ICE
- Interactive Connectivity Establishment (ICE) 는 브라우저가 peer를 통한 연결이 가능하도록 하게 해주는 프레임워크입니다. 
- Peer A에서 Peer B까지 단순하게 연결하는 것으로는 작동하지 않는 것에 대한 이유는 많이 있습니다. 
- 연결을 시도하는 방화벽을 통과해야하기도 하고, 단말에 퍼블릭 IP가 없다면 유일한 주소값을 할당해야할 필요도 있으며 라우터가 peer간의 직접연결을 허용하지 않을 때에는 데이터를 릴레이해야할 경우도 있습니다. 
- ICE는 이러한 작업을 수행하기 위해 STUND과 TURN 서버 둘다 혹은 하나의 서버를 사용합니다.

## STUN
- Session Traversal Utilities for NAT (STUN) (단축어 안의 단축어) 는 당신의 공개 주소(public address)를 발견하거나 peer간의 직접 연결을 막는 등의 라우터의 제한을 결정하는 프로토콜입니다.
- 클라이언트는 인터넷을 통해 클라이언트의 공개주소와 라우터의 NAT 뒤에 있는 클라이언트가 접근가능한지에 대한 답변을 위한 요청을 STUN서버에 보냅니다.

## NAT
- Network Address Translation (NAT) 는 단말에 공개 IP주소를 할당하기 위해 사용됩니다. 
- 라우터는 공개 IP 주소를 갖고 있고 모든 단말들은 라우터에 연결되어 있으며 비공개 IP주소(private IP Address)를 갖고 있습니다. 
- 요청은 단말의 비공개 주소로부터 라우터의 공개 주소와 유일한 포트를 기반으로 번역될 것입니다. 
- 이러한 경유로 각각의 단말이 유일한 공개 IP 없이 인터넷 상에서 검색 될 수 있는 방법입니다.
- 어떠한 라우터들은 네트워크에 연결할수 있는 제한을 갖고 있습니다. 따라서 STUN서버에 의해 공개 IP주소를 발견한다고 해도 모두가 연결을 할수 있다는 것은 아닙니다. 
- 이를 위해 TURN이 필요합니다.
- 


