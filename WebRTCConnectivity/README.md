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

