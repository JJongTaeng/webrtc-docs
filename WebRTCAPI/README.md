[목차로이동](https://github.com/JJongTaeng/webrtc-docs)

# WebRTC API

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

