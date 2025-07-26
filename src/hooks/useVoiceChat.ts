import { useState, useEffect, useRef, useCallback } from 'react';
import { OpenVidu, Session, Publisher, Subscriber } from 'openvidu-browser';
import { createOpenViduSession, createOpenViduToken } from '../api/openviduApi';

interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  isMuted: boolean;
  volume: number;
  stream?: MediaStream;
}

interface UseVoiceChatProps {
  roomId: string;
  userName: string;
  userRole: 'teacher' | 'student';
}

export const useVoiceChat = ({ roomId, userName, userRole }: UseVoiceChatProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const OV = useRef<OpenVidu | null>(null);
  const session = useRef<Session | null>(null);
  const publisher = useRef<Publisher | null>(null);
  const subscribers = useRef<Map<string, Subscriber>>(new Map());
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 세션/토큰 발급
  const getSessionAndToken = useCallback(async () => {
    try {
      const sessionRes = await createOpenViduSession(roomId);
      const sessionId = sessionRes.data.sessionId;
      const tokenRes = await createOpenViduToken(sessionId, 'PUBLISHER');
      return { sessionId, token: tokenRes.data.token };
    } catch (error) {
      console.error('[useVoiceChat] 세션/토큰 발급 실패:', error);
      throw new Error('세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [roomId]);

  // 정리 함수
  const cleanup = useCallback(() => {
    console.log('[useVoiceChat] 정리 시작');

    // 재시도 타이머 정리
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // 세션 정리
    if (session.current) {
      try {
        session.current.disconnect();
      } catch (error) {
        console.warn('[useVoiceChat] 세션 정리 중 에러:', error);
      }
    }

    // 참조 정리
    OV.current = null;
    session.current = null;
    publisher.current = null;
    subscribers.current.clear();

    // 상태 초기화
    setParticipants([]);
    setIsEnabled(false);
    setIsMuted(false);
    setVoiceConnected(false);
    setIsConnecting(false);

    console.log('[useVoiceChat] 정리 완료');
  }, []);

  // 음성채팅 입장/퇴장
  const toggleEnabled = useCallback(async () => {
    if (isEnabled) {
      cleanup();
      return;
    }

    if (isConnecting) {
      console.log('[useVoiceChat] 이미 연결 중입니다.');
      return;
    }

    setIsConnecting(true);

    try {
      const { sessionId, token } = await getSessionAndToken();
      console.log(`[useVoiceChat] 세션/토큰 발급 완료: ${sessionId}`);

      OV.current = new OpenVidu();
      session.current = OV.current.initSession();
      console.log(`[useVoiceChat] OpenVidu 세션 초기화 완료`);

      // 스트림 생성 이벤트
      session.current.on('streamCreated', (event: any) => {
        console.log(
          `[useVoiceChat] streamCreated 이벤트 발생:`,
          event.stream.connection.connectionId,
        );
        const connectionId = event.stream.connection.connectionId;

        // 자기 자신은 제외
        if (connectionId === session.current!.connection.connectionId) {
          console.log(`[useVoiceChat] 자기 자신의 스트림이므로 제외: ${connectionId}`);
          return;
        }

        console.log(`[useVoiceChat] 스트림 생성됨: ${connectionId}`);

        // 스트림 구독
        const subscriber = session.current!.subscribe(event.stream, undefined);
        subscribers.current.set(connectionId, subscriber);
        console.log(`[useVoiceChat] 스트림 구독 완료: ${connectionId}`);

        // 참여자 정보 파싱
        let participantName = '참여자';
        let participantRole: 'teacher' | 'student' = 'student';

        if (event.stream.connection.data) {
          try {
            const outerData = JSON.parse(event.stream.connection.data);
            const clientData = JSON.parse(outerData.clientData);
            participantName = clientData.name || '참여자';
            participantRole = clientData.role === 'teacher' ? 'teacher' : 'student';
            console.log(`[useVoiceChat] 참여자 정보 파싱: ${participantName} (${participantRole})`);
          } catch (error) {
            console.warn('clientData 파싱 실패:', error);
          }
        }

        // 참여자 추가
        setParticipants((prev) => {
          if (prev.find((p) => p.id === connectionId)) {
            console.log(`[useVoiceChat] 이미 존재하는 참여자: ${connectionId}`);
            return prev;
          }
          console.log(`[useVoiceChat] 새 참여자 추가: ${participantName}`);
          return [
            ...prev,
            {
              id: connectionId,
              name: participantName,
              role: participantRole,
              isMuted: false,
              volume: 100,
              stream: undefined,
            },
          ];
        });

        // 스트림 재생 시 참여자 스트림 설정
        subscriber.on('streamPlaying', () => {
          console.log(`[useVoiceChat] ${participantName} 스트림 재생 시작`);
          try {
            const mediaStream = subscriber.stream.getMediaStream();
            console.log(
              `[useVoiceChat] ${participantName} streamPlaying에서 미디어 스트림:`,
              !!mediaStream,
            );
            if (mediaStream) {
              setParticipants((prev) =>
                prev.map((p) => (p.id === connectionId ? { ...p, stream: mediaStream } : p)),
              );
            } else {
              console.warn(
                `[useVoiceChat] ${participantName} streamPlaying에서 미디어 스트림이 null입니다`,
              );
            }
          } catch (error) {
            console.error(`[useVoiceChat] ${participantName} streamPlaying 에러:`, error);
          }
        });

        // ICE 연결 완료 후 스트림 설정 (streamPlaying 이벤트가 발생하지 않는 경우 대비)
        const checkAndSetStream = () => {
          try {
            const mediaStream = subscriber.stream.getMediaStream();
            if (mediaStream) {
              console.log(`[useVoiceChat] ${participantName} ICE 연결 후 스트림 설정`);
              setParticipants((prev) =>
                prev.map((p) => (p.id === connectionId ? { ...p, stream: mediaStream } : p)),
              );
            }
          } catch (error) {
            console.warn(`[useVoiceChat] ${participantName} ICE 연결 후 스트림 설정 실패:`, error);
          }
        };

        // ICE 연결 완료 후 1초, 3초, 5초에 스트림 설정 시도
        setTimeout(checkAndSetStream, 1000);
        setTimeout(checkAndSetStream, 3000);
        setTimeout(checkAndSetStream, 5000);
      });

      // 스트림 제거 이벤트
      session.current.on('streamDestroyed', (event: any) => {
        const connectionId = event.stream.connection.connectionId;
        console.log(`[useVoiceChat] 스트림 제거: ${connectionId}`);
        subscribers.current.delete(connectionId);
        setParticipants((prev) => prev.filter((p) => p.id !== connectionId));
      });

      // 세션 연결
      const clientDataString = JSON.stringify({
        name: userName,
        role: userRole,
      });

      console.log(`[useVoiceChat] 세션 연결 시작: ${userName} (${userRole})`);
      await session.current.connect(token, {
        clientData: clientDataString,
      });
      console.log(`[useVoiceChat] 세션 연결 완료`);

      // Publisher 생성
      publisher.current = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: false,
        publishAudio: true,
        publishVideo: false,
      });
      console.log(`[useVoiceChat] Publisher 생성 완료`);

      await session.current.publish(publisher.current);
      console.log(`[useVoiceChat] Publisher 발행 완료`);

      setIsEnabled(true);
      setVoiceConnected(true);
      setIsConnecting(false);
      console.log(`[useVoiceChat] 음성채팅 입장 완료`);
    } catch (error) {
      console.error('OpenVidu 입장 실패:', error);
      setIsConnecting(false);

      // 에러 메시지 표시
      const errorMessage = error instanceof Error ? error.message : '음성채팅 입장에 실패했습니다.';
      alert(errorMessage);

      // 정리
      cleanup();
    }
  }, [isEnabled, isConnecting, getSessionAndToken, userName, userRole, cleanup]);

  // 음소거 토글
  const toggleMute = useCallback(() => {
    const pub = publisher.current;
    if (!pub) return;
    const newMuted = !isMuted;
    pub.publishAudio(!newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  // 볼륨 변경
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  // 참여자 음소거 토글
  const toggleParticipantMute = useCallback((participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isMuted: !p.isMuted } : p)),
    );
  }, []);

  // 참여자 볼륨 변경
  const handleParticipantVolumeChange = useCallback((participantId: string, newVolume: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, volume: newVolume } : p)),
    );
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isEnabled,
    isMuted,
    volume,
    isConnecting,
    toggleEnabled,
    toggleMute,
    handleVolumeChange,
    participants,
    toggleParticipantMute,
    handleParticipantVolumeChange,
    isConnected: voiceConnected,
  };
};
