[목차로이동](https://github.com/JJongTaeng/webrtc-docs)

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
