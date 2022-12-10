[목차로이동](https://github.com/JJongTaeng/webrtc-docs)

# WebRTC connectivity
- 다양한 WebRTC 관련 프로토콜이 피어 간에 연결을 생성하고 데이터 및/또는 미디어를 전송하기 위해 서로 상호 작용하는 방법이 있습니다.

## Signaling
- 안타깝게도 WebRTC는 중간에 일종의 서버 없이는 연결을 만들 수 없습니다.
- 초기 연결을 도와주는 시그널링 서버가 있어야합니다.
- 교환해야 하는 정보는 아래에 언급된 SDP만 포함하는 Offer와 Answer입니다.
- 연결의 개시자가 될 Peer A는 Offer을 생성합니다.
- 그런 다음 선택한 시그널링 서버를 사용하여 Peer B에게 이 Offer을 보냅니다.
- 그런 다음 시그널링 서버를 따라 Peer A로 다시 보냅니다.

### Session Descriptions
WebRTC 연결의 끝점 구성을 Session Description이라고 합니다. description에는 전송되는 미디어 종류, 해당 형식, 사용 중인 전송 프로토콜, 엔드포인트의 IP 주소 및 포트, 미디어 전송 엔드포인트를 설명하는데 필요한 기타정보가 포함됩니다. 

이 정보는 SDP를 사용하여 교환 및 저장됩니다. 

사용자가 다른 사용자에게 WebRTC 호출을 시작하면 Offer라는 특별한 description이 생성됩니다. 

이 description에는 발신자가 제안한 연결 구성에 대한 정보가 포함됩니다. 

그런 다음 수신자는 연결 종료에 대한 설명인 answer로 응답합니다. 

이러한 방식으로 두 장치는 미디어 데이터를 교환하기 위해 필요한 정보를 서로 공유합니다. 

이 교환은 NAT에 의해 분리된 경우에도 offer와 answer를 교환하기 위해 ICE를 사용하여 처리합니다. 

offer와 answer는 연결이 처음 설정될 뿐만 아니라 연결 형식이나 기타 구성을 변경해야할 때마다 수행됩니다. 

새로운 호출이든 기존 호출의 재구성이든 상관없이 offer와 answer를 교환하기 위해 수행해야하는 기본 단계는 다음과 같습니다.

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



### Pending and current description(보류 및 현재의 description)

프로세스를 한 단계 깊이 살펴보면 이 두 description을 반환하는 속성인 localDescription, remoteDescription이 보이는 것처럼 단순하지 않다는 것을 알 수 있습니다.

renegotiation 중에 호환되지 않는 형식을 offer하기 때문에 offer가 거부될 수 있으므로 각 엔드포인트는 새 형식을 offer할 수 있지만 다른 peer에서 수락할 때까지 실제로 전환하지 않는 기능이 필요합니다.

이러한 이유로 WebRTC는 pending과 current description을 사용합니다.

_current description(RTCPeerConnection.currentLocalDescription 및 RTCPeerConnection.currentRemoteDescription)_ 은 현재 연결에서 실제로 사용중인 description을 나타냅니다.

이것은 양측이 사용하기로 완전히 동의한 가장 최근의 연결입니다.

_pending description(`RTCPeerConnection.pendingLocalDescription` 및 `RTCPeerConnection.pendingRemoteDescription`에 의해 반환됨)_ 은 각각 `setLocalDescription()` 또는 `setRemoteDescription()` 호출 후 현재 고려중인 description을 나타냅니다.

`RTCPeerConnection.localDescription`, `RTCPeerConnection.remoteDescription` 에서 반환된 `description`을 읽을 때 `pending` 상태인 `description`이 있는 경우 반환된 값은 pendingLocalDescription/pendingRemoteDescription의 값입니다. 

그렇지 않으면 currentLocalDescription / currentRemoteDescription이 반환됩니다.

`setLocalDescription()` 또는 `setRemoteDescription()`을 호출하여 description을 변경하면 지정된 description이 pending 상태의 description으로 설정되고 WebRTC 계층이 허용 여부를 평가하기 시작합니다.

제안된 description에 동의하면 currentLocalDescription, currentRemoteDescription 값이 pending description으로 변경됩니다.

그리고 pending description은 다시 null로 설정되어 pending description 이 없음을 나타냅니다.

### ICE candidates
peer들은 미디어(offer, answer, sdp)에 대한 정보 교환 뿐아니라 네트워크 연결에 대한 정보를 교환해야 합니다.

이것은 ICE candidate로 알려져 있으며 peer가 통신할 수 있는 사용 가능한 방법(직접 또는 TURN 서버를 통해)을 자세히 설명합니다.

일반적으로 각 peer는 가장 좋은 candidates를 먼저 제안하고, 더 나쁜 candidates를 향해 내려갑니다.

이상적으로 candidates는 UDP(더 빠르고 미디어 스트림이 중단되어도 복구가 쉽기 때문)이지만 ICE 표준은 TCP candidates도 허용합니다.

일반적으로 TCP를 사용하는 ICE candidates는 UDP를 사용할 수 없거나 미디어 스트리밍에 적합하지 않은 방식으로 제한되는 경우에만 사용됩니다. 그러나 모든 브라우저가 ICE over TCP를 지원하는 것은 아닙니다.

ICE를 사용하면 candidates가 UDP, TCP 를 통해 연결될 수 있으며, UDP가 일반적으로 더 선호되고 광범위하게 지원됩니다.

각 프로토콜은 몇가지 유형의 candidates를 지원하며 candidates 유형은 데이터가 peer에서 peer로 이동하는 방법을 정의합니다.