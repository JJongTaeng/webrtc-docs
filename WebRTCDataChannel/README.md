[목차로이동](https://github.com/JJongTaeng/webrtc-docs)

# Using WebRTC data channels

이 가이드에서는 피어 연결에 데이터 채널을 추가하는 방법을 살펴보고 임의의 데이터를 안전하게 교환하는 데 사용할 수 있습니다. 즉, 우리가 원하는 모든 종류의 데이터를 우리가 선택한 모든 형식으로 사용할 수 있습니다.

모든 WebRTC 구성 요소는 암호화를 사용해야 하므로 RTCDataChannel에서 전송되는 모든 데이터는 DTLS(Datagram Transport Layer Security)를 사용하여 자동으로 보호됩니다. 

## Creating a data channel

RTCDataChannel에서 사용하는 기본 데이터 전송은 다음 두 가지 방법 중 하나로 만들 수 있습니다.
- WebRTC가 전송을 생성하고 원격 피어에 알리도록 합니다(데이터 채널 이벤트를 수신하도록 함). 이것은 쉬운 방법이며 다양한 사용 사례에 사용할 수 있지만 사용자의 요구에 충분히 유연하지 않을 수 있습니다.
- 데이터 전송을 협상하는 고유한 코드를 작성하고 새 채널에 연결해야 하는 다른 피어에 신호를 보내는 고유한 코드를 작성하십시오.

가장 일반적인 첫 번째부터 시작하여 이러한 각 사례를 살펴보겠습니다.

## Automatic negotiation (자동협상)
종종 피어 연결이 `RTCDataChannel` 연결 협상을 처리하도록 허용할 수 있습니다.

`createDataChannel()` 없이 협상된 속성에 대한 값 지정 또는 속성 값을 false로 지정합니다.

그러면 RTCPeerConnection이 자동으로 트리거되어 협상을 처리하여 원격 피어가 데이터 채널을 만들고 네트워크를 통해 두 채널을 함께 연결합니다.

`RTCDataChannel` 객체는 `createDataChannel()`에 의해 즉시 반환됩니다.

`RTCDataChannel`로 전송되는 `open` 이벤트를 관찰하여 연결이 성공적으로 이루어졌는지 알 수 있습니다.

```javascript
let dataChannel = pc.createDataChannel("MyApp Channel");

dataChannel.addEventListener("open", (event) => {
  beginTransmission(dataChannel);
});
```

### Manual negotitaion (수동협상)
데이터 채널 연결을 수동으로 협상하려면 먼저 `RTCPeerConnection`에서 `createDataChannel()` 메서드를 사용하여 새 `RTCDataChannel` 객체를 생성하고 협상된 속성이 true로 설정된 옵션을 지정해야 합니다.

이는 사용자를 대신하여 채널 협상을 시도하지 않도록 피어 연결에 신호를 보냅니다.

그런 다음 웹 서버 또는 기타 수단을 사용하여 대역 외 연결을 협상합니다.

이 프로세스는 동일한 ID를 사용하여 협상된 속성도 true로 설정된 자체 RTCDataChannel을 만들어야 한다는 원격 피어에 신호를 보내야 합니다. 이렇게 하면 RTCPeerConnection에서 두 개체가 연결됩니다.

```javascript
let dataChannel = pc.createDataChannel("MyApp Channel", {
  negotiated: true,
});

dataChannel.addEventListener("open", (event) => {
  beginTransmission(dataChannel);
});

requestRemoteChannel(dataChannel.id);
```
이 코드 스니펫에서는 협상을 true로 설정하여 채널을 생성한 다음 requestRemoteChannel()이라는 함수를 사용하여 협상을 트리거하고 로컬 채널과 동일한 ID로 원격 채널을 생성합니다.

이렇게 하면 서로 다른 속성을 사용하여 각 피어와 데이터 채널을 생성하고 동일한 id 값을 사용하여 선언적으로 채널을 생성할 수 있습니다.

## Buffering
WebRTC 데이터 채널은 아웃바운드 데이터의 버퍼링을 지원합니다.

이것은 자동으로 처리됩니다. 버퍼 크기를 제어할 수 있는 방법은 없지만 현재 버퍼링된 데이터의 양을 알 수 있으며 대기 중인 데이터에서 버퍼가 부족해지기 시작할 때 이벤트로 알림을 받도록 선택할 수 있습니다.

이를 통해 메모리를 과도하게 사용하거나 채널을 완전히 낭비하지 않고 항상 데이터를 보낼 준비가 되어 있는지 확인하는 효율적인 루틴을 쉽게 작성할 수 있습니다.

## Understanding message size limits(메시지 크기 제한 이해)
네트워크를 통해 전송되는 모든 데이터에는 크기 제한이 있습니다. 기본적으로 개별 네트워크 패킷은 특정 값보다 클 수 없습니다(정확한 수는 사용 중인 네트워크 및 전송 계층에 따라 다름).

어플리케이션 수준에서 WebRTC는 네트워크 전송 계층의 최대 패킷 크기보다 큰 메시지를 지원하는 기능을 제공합니다.

다양한 사용자 에이전트에 대한 크기 제한이 무엇인지, 더 큰 메시지를 보내거나 받을 때 응답하는 방법을 반드시 알 필요가 없기 때문에 이것은 상황을 복잡하게 만들 수 있습니다.

사용자 에이전트가 SCTP(Stream Control Transmission Protocol) 데이터를 처리하기 위해 동일한 기본 라이브러리를 공유하는 경우에도 라이브러리 사용 방식으로 인해 여전히 변형이 있을 수 있습니다.

예를 들어 Firefox와 Google Chrome은 모두 usrsctp 라이브러리를 사용하여 SCTP를 구현합니다.

그러나 RTCDataChannel의 데이터 전송이 라이브러리를 호출하고 반환하는 오류에 반응하는 방식의 차이로 인해 실패할 수 있는 상황이 여전히 있습니다.

16kiB보다 작은 메시지는 모든 주요 사용자 에이전트가 동일한 방식으로 처리하므로 걱정 없이 보낼 수 있습니다. 그 외에는 상황이 더 복잡해집니다.

## Concerns with large messages (대용량 메시지에 대한 우려)
현재 64kiB(브라우저 간 데이터 교환을 지원하려는 경우 16kiB)보다 큰 메시지에 RTCDataChannel을 사용하는 것은 실용적이지 않습니다.

문제는 SCTP(RTCDataChannel에서 데이터를 송수신하는 데 사용되는 프로토콜)가 원래 시그널링 프로토콜로 사용하도록 설계되었습니다.

메시지는 상대적으로 작을 것으로 예상되었습니다.

신호 메시지가 MTU보다 커야 하는 경우를 대비하여 네트워크 계층의 MTU보다 큰 메시지에 대한 지원이 나중에 추가되었습니다.

이 기능을 사용하려면 메시지의 각 조각에 연속적인 시퀀스 번호가 있어야 하므로 메시지 사이에 다른 데이터가 삽입되지 않고 차례로 전송되어야 합니다.

이것이 결국 문제가 되었습니다. 시간이 지남에 따라 다양한 응용 프로그램(WebRTC를 구현하는 응용 프로그램 포함)이 SCTP를 사용하여 점점 더 큰 메시지를 전송하기 시작했습니다.

결국 메시지가 너무 커지면 큰 메시지의 전송이 해당 데이터 채널의 다른 모든 데이터 전송을 차단할 수 있다는 사실을 깨달았습니다.

이것은 브라우저가 더 큰 메시지를 지원하기 위한 현재 표준을 적절하게 지원할 때 문제가 됩니다.

EOR플래그는 메시지가 단일 페이로드로 처리되어야 하는 시리즈의 마지막 메시지일 때를 나타내는 플래그입니다.

이것은 Firefox 57에서 구현되었지만 Chrome에서는 아직 구현되지 않았습니다

EOR 지원을 사용하면 RTCDataChannel 페이로드가 훨씬 더 커질 수 있습니다(공식적으로 최대 256kiB이지만 Firefox의 구현은 무려 1GiB로 제한됨).

256kiB에서도 긴급 트래픽을 처리하는 데 눈에 띄는 지연이 발생할 만큼 충분히 큽니다. 더 크게 진행하면 운영 조건이 확실하지 않으면 지연을 견딜 수 없게 될 수 있습니다.

이 문제를 해결하기 위해 스트림 스케줄러의 새로운 시스템(일반적으로 "SCTP ndata 사양"이라고 함)은 WebRTC 데이터 채널을 구현하는 데 사용되는 스트림을 포함하여 다른 스트림에서 전송된 메시지를 인터리브할 수 있도록 설계되었습니다.

이 제안은 아직 IETF 초안 형식이지만 일단 구현되면 기본적으로 크기 제한 없이 메시지를 보낼 수 있습니다. SCTP 계층이 기본 하위 메시지를 자동으로 인터리브하여 모든 채널의 데이터가 통과할 기회를 갖도록 보장하기 때문입니다.

## Security

WebRTC를 사용하여 전송되는 모든 데이터는 암호화됩니다. RTCDataChannel의 경우 사용되는 암호화는 TLS(전송 계층 보안)를 기반으로 하는 DTLS(데이터그램 전송 계층 보안)입니다.

TLS는 모든 HTTPS 연결을 보호하는 데 사용되므로 데이터 채널에서 보내는 모든 데이터는 사용자의 브라우저에서 보내거나 받는 다른 데이터만큼 안전합니다.

보다 근본적으로 WebRTC는 두 사용자 에이전트 간의 P2P 연결이므로 데이터는 웹 또는 애플리케이션 서버를 통과하지 않습니다. 이렇게 하면 데이터를 가로챌 기회가 줄어듭니다.

