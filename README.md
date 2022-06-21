# 자바스크립트(타입스크립트) 디자인 패턴

## 목차
1. [WebRTC 소개](#WebRTC-소개)


# WebRTC 소개
- 중개자 없이 브라우저 간에 임의의 데이터를 교환할 수 있도록 하는 기술입니다.
- 오디오 및/또는 비디오 미디어 또한 교환할 수 있습니다.
- WebRTC를 구성하는 일련의 표준들은 플러그인이나 제 3자 소프트웨어 설치 없이 종단 간 데이터 공유와 화상 회의를 가능하게 합니다.

# 비디오, 오디오 데이터 교환 예제
![webrtc-interface](./WebRTC-Interface.drawio.png)
- 위 이미지 처럼 Signaling Server를 통해 각 설정 정보를 주고 받아서 연결을 시도합니다.
- 연결 완료 이후에는 peer-to-peer 통신이 가능합니다.
- 첫번째로 자신의 stream 정보를 호출합니다. (mediaDevices는 크롬에서 https에서만 지원됩니다.)
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
- 서버에서는 다른 Peer 브라우저 B에게 offer를 전송합니다.
- 브라우저 B또한 A와 같이 myStream과 myPeerConnection을 생성했습니다.
- 브라우저 B는 offer 데이터를 받아서 remoteDescription을 설정해줍니다. 또 answer을 생성해서 localDescription에 설정하고, 브라우저 A에게 answer을 전달합니다. 
    ```typescript
      myPeerConnection.setRemoteDescription(offer);
      const answer = await myPeerConnection.createAnswer();
      myPeerConnection.setLocalDescription(answer);
      // answer 서버로 전송
    ```
- answer을 받은 브라우저 A는 remoteDescription에 answer을 설정합니다.
    ```typescript
      myPeerConnection.setRemoteDescription(answer);
    ```
