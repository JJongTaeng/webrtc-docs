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

### Choosing a candidate pair (candidate 쌍 선택)
ICE 계층은 controlling agent 역할을 할 두 피어 중 하나를 선택합니다.

이것은 연결에 사용할 candidate 쌍에 대한 최종 결정을 내리는 ICE 에이전트입니다.

다른 피어를 controlled agent 라고 합니다.

RTCIceCandidate.transport.role의 값을 검사하여 연결의 끝이 어느 것인지 식별할 수 있습니다.

일반적으로 어느 것이 무엇인지는 중요하지 않습니다.

controlling agent는 어떤 candidate 쌍을 사용할지에 대한 최종 결정을 내릴 책임이 있을 뿐만 아니라 필요한 경우 STUN 및 업데이트된 offer을 사용하여 해당 선택을 controlled agent에 알립니다.

controlled agent는 사용할 candidate 쌍을 알려주기만을 기다립니다.

단일 ICE 세션으로 인해 controlling agent가 둘 이상의 candidate 쌍을 선택할 수 있다는 점을 염두에 두는 것이 중요합니다.

그렇게 하고 controlled agent와 해당 정보를 공유할 때마다 두 피어는 새 candidate 쌍이 설명하는 새 구성을 사용하도록 연결을 재구성합니다.

ICE 세션이 완료되면 ICE 재설정이 발생하지 않는 한 현재 유효한 구성이 최종 구성이 됩니다.

candidate의 각 생성이 끝날 때 candidate 속성이 빈 문자열인 RTCIceCandidate 형식으로 candidate 종료 알림이 전송됩니다.

이 candidate는 해당 알림을 원격 피어에 전달하기 위해 평소와 같이 addIceCandidate() 메서드를 사용하여 연결에 추가해야 합니다.

현재 협상 교환 중에 예상되는 candidate가 더 이상 없으면 candidate 속성이 null인 RTCIceCandidate를 전달하여 candidate 종료 알림을 보냅니다.

이 메시지는 원격 피어로 보낼 필요가 없습니다.

이는 iceGatheringState가 완료로 변경되는 것을 감시하는 대신 icegatheringstatechange 이벤트를 감시하여 감지할 수 있는 상태의 레거시 알림입니다.

## When things go wrong
negotiation 중에 일이 잘 풀리지 않는 경우가 있습니다.

예를 들어 하드웨어 또는 네트워크 구성 변경에 적응하기 위해 연결을 재협상할 때 협상이 막다른 골목에 도달하거나 협상을 전혀 방해하는 어떤 형태의 오류가 발생할 수 있습니다.

해당 문제에 대한 권한 문제 또는 기타 문제가 있을 수 있습니다.

### ICE 롤백
이미 활성 상태인 연결을 재협상할 때 협상이 실패하는 상황이 발생하면 이미 실행 중인 호출을 종료하고 싶지 않을 것입니다.

결국 연결을 업그레이드 또는 다운그레이드하거나 진행 중인 세션에 적응하려고 했을 가능성이 큽니다.

통화를 중단하는 것은 그러한 상황에서 과도한 반응이 될 것입니다.

대신 ICE 롤백을 시작할 수 있습니다. 롤백은 SDP offer(the connection configuration by extension)을 마지막으로 연결의 signalingState가 안정적이었던 구성으로 복원합니다.

프로그래밍 방식으로 롤백을 시작하려면 유형이 롤백인 설명을 보내십시오. 설명 개체의 다른 속성은 무시됩니다. 또한 ICE 에이전트는 이전에 offer을 생성한 peer가 원격 peer로부터 offer을 받으면 자동으로 롤백을 시작합니다.

즉, 로컬 피어가 이전에 offer을 보냈음을 나타내는 have-local-offer 상태에 있는 경우, 수신된 offer과 함께 setRemoteDescription()을 호출하면 협상이 발신자인 원격 피어에서 발신자인 로컬 피어로 전환되도록 롤백이 트리거됩니다.

## The entire exchange in a complicated diagram
![diagram](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity/webrtc-complete-diagram.png)