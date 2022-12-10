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

# WebRTC Protocols

## STUN/TURN SERVER?
- WebRTC 통신은 Peer to Peer 방식으로 서로 데이터를 주고 받아야 하기 때문에 보내고 받는 Peer의 Public IP를 알고 있어야 합니다.
- 따라서 ICE 기술을 사용하여 Peer의 Public IP를 찾아야합니다.


### ICE(Interactive Connectivity Establishment)
- ICE(Interactive Connectivity Establishment)는 Peer to Peer 네트워킹 에서 두 대의 컴퓨터가 가능한 한 직접 서로 대화하는 방법을 찾기 위해 컴퓨터 네트워킹 에서 사용되는 기술 입니다.
- 중앙 서버를 통한 통신은 비용이 많이 들지만 브라우저 또는 클라이언트 간의 직접 통신은 NAT, 방화벽 및 기타 네트워크 장벽으로 인해 매우 까다롭습니다.
- Peer A에서 Peer B까지 단순하게 연결하는 것으로는 작동하지 않는 것에 대한 이유는 많이 있습니다.
- 연결을 시도하는 방화벽을 통과해야하기도 하고, 단말에 퍼블릭 IP가 없다면 유일한 주소값을 할당해야할 필요도 있으며 라우터가 peer간의 직접연결을 허용하지 않을 때에는 데이터를 릴레이해야할 경우도 있습니다.
- ICE는 통신하는 피어가 공용 IP 주소를 발견하고 통신하여 다른 피어가 도달할 수 있도록 하는 프레임워크를 제공합니다.
- ICE는 이러한 작업을 수행하기 위해 STUN과 TURN 서버 둘다 혹은 하나의 서버를 사용합니다.

### STUN(Session Traversal Utilities for NAT)
- STUN(Session Traversal Utilities for NAT)은 NAT 분류를 포함하여 이러한 주소(Public IP) 검색을 위한 표준화된 프로토콜입니다.
- 실시간 음성, 비디오, 메시징 및 기타 대화형 통신에서 NAT 게이트웨이 통과를 위한 네트워크 프로토콜을 포함한 표준화된 방법 집합입니다.
- STUN은 ICE(Interactive Connectivity Establishment), SIP(Session Initiation Protocol) 및 WebRTC와 같은 다른 프로토콜에서 사용하는 도구입니다.
- 이 프로토콜은 일반적으로 공용 인터넷인 NAT의 반대편(공용) 쪽에 있는 타사 네트워크 서버(STUN 서버)의 지원이 필요합니다.
- 일반적으로 STUN 클라이언트는 STUN 서버에 메시지를 보내 공용 IP 및 포트 정보를 얻은 다음 STUN 서버가 해당 정보를 검색할 수 있습니다. 이 Public IP 및 Port 정보를 사용하여 클라이언트는 인터넷을 통해 P2P 통신을 합니다

![STUN](https://miro.medium.com/max/1302/1*HmMdrpVBTP2vYMhrVOdNOw.webp)

### TURN(Traversal Using Relays around NAT)
- TURN(Traversal Using Relays around NAT)은 WebRTC 애플리케이션용 네트워크 주소 변환기(NAT) 또는 방화벽의 순회를 지원하는 프로토콜입니다.
- 경우에 따라 클라이언트 통신 끝점이 서로 다른 유형의 NAT 뒤에 붙어 있거나 대칭 NAT가 사용 중인 경우 TURN 서버라고 하는 릴레이 서버를 통해 미디어를 보내는 것이 더 쉬울 수 있습니다
- 일반적으로 TURN 클라이언트는 먼저 TURN 서버에 메시지를 보내서 TURN 서버에 IP 주소와 포트를 할당합니다.
- 할당이 성공하면 클라이언트는 IP 주소와 포트 번호를 사용하여 피어와 통신합니다.
- TURN 패킷은 상대방의 목적지 주소를 담고 있으며, 이 패킷을 UDP 프로토콜 패킷으로 변환하여 상대방에게 보냅니다.
- 더 많은 클라이언트 연결이 설정되는 경우 서버 활용 및 막대한 대역폭 사용으로 인해 TURN 서버 비용이 높습니다.


![TURN](https://miro.medium.com/max/1400/1*k9ARIJ9Jfkscjji1SNQ4ig.webp)

### SDP
- Session Description Protocol (SDP) 은 해상도나 형식, 코덱, 암호화등의 멀티미디어 컨텐츠의 연결을 설명하기 위한 표준입니다.
- 이러한 것이 두개의 peer가 다른 한쪽이 데이터가 전송되고 있다는 것을 알게 해줍니다. 이것은 기본적으로 미디어 컨텐츠 자체가 아닌 컨텐츠에 대한 메타데이터 설명이 됩니다.
- 기술적으로 보자면 SDP 는 프로토콜이 아닙니다. 그러나 데이터 포멧은 디바이스간의 미디어를 공유하기 위한 연결을 설명하기 위해 사용됩니다.

#### 구조
- SDP는 한줄 이상의 UTF-8 텍스트로 구성됩니다. 이 텍스트의 시작은 한글자로 구성되며 한글자 뒤에 등호기호 ("=")가 옵니다. 그리고 그 뒤에는 포멧에 맞게 값이나 설명이 적혀있습니다.
- 한글자로 시작되는 그 글자는 일반적으로 "letter-lines"를 뜻합니다. 예를들어 미디어 설명을 제공하는 것이라면 "m" 이라고 적어두고 이것은 m-lines을 뜻합니다.

## WebRTC connectivity
- 다양한 WebRTC 관련 프로토콜이 피어 간에 연결을 생성하고 데이터 및/또는 미디어를 전송하기 위해 서로 상호 작용하는 방법이 있습니다.

### Signaling
- 안타깝게도 WebRTC는 중간에 일종의 서버 없이는 연결을 만들 수 없습니다.
- 초기 연결을 도와주는 시그널링 서버가 있어야합니다.
- 교환해야 하는 정보는 아래에 언급된 SDP만 포함하는 Offer와 Answer입니다.
- 연결의 개시자가 될 Peer A는 Offer을 생성합니다.
- 그런 다음 선택한 시그널링 서버를 사용하여 Peer B에게 이 Offer을 보냅니다.
- 그런 다음 시그널링 서버를 따라 Peer A로 다시 보냅니다.

#### Session Descriptions
- WebRTC 연결의 끝점 구성을 Session Description이라고 합니다.
- description에는 전송되는 미디어 종류, 해당 형식, 사용 중인 전송 프로토콜, 엔드포인트의 IP 주소 및 포트, 미디어 전송 엔드포인트를 설명하는데 필요한 기타정보가 포함됩니다.
- 이 정보는 SDP를 사용하여 교환 및 저장됩니다.
- 사용자가 다른 사용자에게 WebRTC 호출을 시작하면 Offer라는 특별한 description이 생성됩니다.
- 이 description에는 발신자가 제안한 연결 구성에 대한 정보가 포함됩니다.
- 그런 다음 수신자는 연결 종료에 대한 설명인 answer로 응답합니다.
- 이러한 방식으로 두 장치는 미디어 데이터를 교환하기 위해 필요한 정보를 서로 공유합니다.
- 이 교환은 NAT에 의해 분리된 경우에도 offer와 answer를 교환하기 위해 ICE를 사용하여 처리합니다.
- offer와 answer는 연결이 처음 설정될 뿐만 아니라 연결 형식이나 기타 구성을 변경해야할 때마다 수행됩니다.
- 새로운 호출이든 기존 호출의 재구성이든 상관없이 offer와 answer를 교환하기 위해 수행해야하는 기본 단계는 다음과 같습니다.

  1. 호출자는 `MediaDevices.getUserMedia`를 통해 로컬 미디어를 캡처합니다.
  2. 호출자는 `RTCPeerConnection`을 생성하고, `RTCPeerConnection.addTrack()`을 호출합니다. (`addStream`은 더이상 사용되지 않습니다.)
  3. 호출자는 `offer`을 생성하기 위해 `RTCPeerConnection.createOffer()`를 호출합니다.
  4. 호출자는 `RTCPeerConnection.setLocalDescription()`을 호출하여 해당 `offer`을 _local description_(자신 엔드포인트에대한 description) 으로 설정합니다.
  5. `setLocalDescription()` 이후 호출자는 STUN 서버에 ice candidates 생성을 요청합니다.
  6. 호출자는 시그널링 서버를 이용하여 의도한 통화 수신자에게 `offer`를 전송합니다.
  7. 수신자는 `offer`를 받고 `RTCPeerConnection.setRemoteDescription()`을 호출하여 이를 _remote description(다른 엔드포인트에대한 description)_으로 설정합니다.
  8. 수신자는 연결에 필요한 모든 설정을 수행합니다. Local media를 캡처하고, 호출자, 수신자 각각의 미디어트랙을 `RTCPeerConnection.addTrack()`을 통해 피어 연결합니다.
  9. 그런 다음 수신자는 `RTCPeerConnection.createAnswer()`를 호출하여 `answer`를 생성합니다.
  10. 수신자는 `RTCPeerConnection.setLocalDescription()`을 호출하여 생성된 `answer` 를 전달하고 `answer`를 local description으로 설정합니다. 수신자는 이제 연결의 양쪽 끝 구성을 알고 있습니다.
  11. 수신자는 시그널링 서버를 사용하여 호출자에게 `answer`를 보냅니다.
  12. 호출자가 `answer`를 받습니다.
  13. 호출자는 `RTCPeerConnection.setRemoteDescription()`을 호출하여 answer를 remote description으로 설정합니다. 이제 호출자 또한 연결의 양쪽 끝 구성을 알고있습니다.

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
- RTCPeerConnection에서 connectionstatechange 이벤트가 생길 때, 브라우저에 의해 호출되는 함수입니다.
- 연결의 상태 집합체가 변할 때마다 발생합니다.
- 이 상태 집합체는 연결에 의해 사용되는 각각의 네트워크 전송 상태들의 묶음입니다.
- 해당 이벤트 객체는 특별한 정보를 담고 있지는 않습니다. 새로운 상태를 확인하려면 피어 연결의 connectionState에 해당하는 값을 살펴보십시오.
- example
```javascript
pc.onconnectionstatechange = function(event) {
  switch(pc.connectionState) {
    case "connected":
      // 연결이 완전히 성공
      break;
    case "disconnected":
    case "failed":
      // 하나 이상의 전송이 예기치 않게 또는 오류로 종료됌
      break;
    case "closed":
      // 연결이 종료됌
      break;
  }
}
```

### datachannel
### icecandidate
### icecandidateerror
### iceconnectionstatechange
### icegatheringstatechange
### negotiationneeded
### signalingstatechange
### track


