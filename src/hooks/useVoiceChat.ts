import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import socket from '../lib/socket';

interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  isMuted: boolean;
  volume: number;
}

interface UseVoiceChatProps {
  roomId: string;
  userId: string;
  userName: string;
  userRole: 'teacher' | 'student';
  isConnected: boolean; // 연결 상태를 props로 받음
}

export const useVoiceChat = ({
  roomId,
  userId,
  userName,
  userRole,
  isConnected,
}: UseVoiceChatProps) => {
  // 내 마이크 상태
  const [isEnabled, setIsEnabled] = useState(false); // 초기값을 false로 변경
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);

  // 참여자 목록
  const [participants, setParticipants] = useState<Participant[]>([]);

  // 참여자 스트림 목록
  const [participantStreams, setParticipantStreams] = useState<{ [id: string]: MediaStream }>({});

  // 연결 상태 - props로 받은 값 사용
  const [voiceConnected, setVoiceConnected] = useState(false);
  const voiceConnectedRef = useRef(false);

  // Refs
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<Map<string, Peer.Instance>>(new Map());
  const audioElements = useRef<Map<string, HTMLAudioElement>>(new Map());

  // 마이크 활성화/비활성화 + 음성채팅 참여 / 퇴장
  const toggleEnabled = useCallback(async () => {
    if (isEnabled) {
      // 마이크 비활성화 + 음성채팅 퇴장
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
        localStream.current = null;
      }
      setIsEnabled(false);
      setIsMuted(false);

      // 음성채팅 퇴장 - 모든 피어 연결 정리
      peers.current.forEach((peer) => peer.destroy());
      peers.current.clear();
      audioElements.current.forEach((audio) => audio.remove());
      audioElements.current.clear();
      setParticipantStreams({}); // 참여자 스트림 목록 초기화

      // 참여자 목록 초기화
      setParticipants([]);

      // 서버에 음성채팅 퇴장 알림 전송
      socket.emit('voice:leave', { roomId, userId });

      // 음성채팅 연결 상태 리셋
      setVoiceConnected(false);
      voiceConnectedRef.current = false;

      console.log('음성채팅 퇴장 완료');
    } else {
      // 마이크 활성화 + 음성채팅 참가
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true, // 에코(울림) 제거
            noiseSuppression: true, // 배경 잡음 제거
            autoGainControl: true, // 자동 볼륨 조절
            channelCount: 2, // 2: 스테레오, 1: 모노
            sampleRate: 48000, // 샘플레이트(Hz), 48000이 고음질 표준
            sampleSize: 16, // 샘플 비트수(16비트가 일반적)
          },
        });
        localStream.current = stream;
        setIsEnabled(true);

        // 음성채팅 참가
        if (isConnected && !voiceConnectedRef.current) {
          setVoiceConnected(true);
          voiceConnectedRef.current = true;

          socket.emit('voice:join', { roomId, userId, userName, userRole });
          console.log('음성채팅 참가 완료');
        }

        // 기존 피어들에게 새로운 스트림 전송
        peers.current.forEach((peer, peerId) => {
          if (peer.streams && peer.streams[0]) {
            peer.replaceTrack(
              peer.streams[0].getAudioTracks()[0],
              stream.getAudioTracks()[0],
              peer.streams[0],
            );
          }
        });
      } catch (error) {
        console.error('마이크 접근 실패:', error);
        alert('마이크 접근 권한이 필요합니다.');
      }
    }
  }, [isEnabled, isConnected, roomId, userId, userName, userRole]);

  // 음소거 토글
  const toggleMute = useCallback(() => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  // 볼륨 변경
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  // 참여자 음소거 토글
  const toggleParticipantMute = useCallback((participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          const newMuted = !p.isMuted;
          // 실제 오디오 음소거 처리
          const audioElement = audioElements.current.get(participantId);
          if (audioElement) {
            audioElement.muted = newMuted;
          }
          return { ...p, isMuted: newMuted };
        }
        return p;
      }),
    );
  }, []);

  // 참여자 볼륨 변경
  const handleParticipantVolumeChange = useCallback((participantId: string, newVolume: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, volume: newVolume } : p)),
    );

    // 실제 오디오 볼륨 변경
    const audioElement = audioElements.current.get(participantId);
    if (audioElement) {
      audioElement.volume = newVolume / 100;
    }
  }, []);

  // 참여자 추가
  const addParticipant = useCallback((participant: Participant) => {
    if (!participant.id || participant.id === 'undefined') {
      console.warn('잘못된 participantId로 참가자 추가 시도, 스킵:', participant.id);
      return (prev: any[]) => prev;
    }
    setParticipants((prev) => {
      // 중복 체크
      const existing = prev.find((p) => p.id === participant.id);
      if (existing) {
        console.log('이미 존재하는 참가자 (스킵):', participant.id, participant.name);
        return prev;
      }

      console.log('새 참가자 추가:', participant.id, participant.name);
      console.log(
        '현재 참여자 목록:',
        prev.map((p) => `${p.id}:${p.name}`),
      );
      const newList = [...prev, participant];
      console.log(
        '추가 후 참여자 목록:',
        newList.map((p) => `${p.id}:${p.name}`),
      );
      return newList;
    });
  }, []);

  // 참여자 제거
  const removeParticipant = useCallback((participantId: string) => {
    console.log('참여자 제거 시도:', participantId);

    setParticipants((prev) => {
      console.log(
        '제거 전 참여자 목록:',
        prev.map((p) => `${p.id}:${p.name}`),
      );
      const filtered = prev.filter((p) => p.id !== participantId);
      console.log(
        '제거 후 참여자 목록:',
        filtered.map((p) => `${p.id}:${p.name}`),
      );
      console.log('제거 전 참여자 수:', prev.length, '제거 후 참여자 수:', filtered.length);
      return filtered;
    });

    setParticipantStreams((prev) => {
      const newObj = { ...prev };
      delete newObj[participantId];
      return newObj;
    });

    // 피어 연결 정리
    const peer = peers.current.get(participantId);
    if (peer) {
      peer.destroy();
      peers.current.delete(participantId);
      console.log('피어 연결 정리 완료:', participantId);
    }

    // 오디오 요소 정리
    const audioElement = audioElements.current.get(participantId);
    if (audioElement) {
      audioElement.remove();
      audioElements.current.delete(participantId);
      console.log('오디오 요소 정리 완료:', participantId);
    }
  }, []);

  // 새로운 피어 연결 생성
  const createPeer = useCallback(
    (participantId: string) => {
      if (!participantId || participantId === 'undefined') {
        console.warn('잘못된 participantId로 피어 생성 시도, 스킵:', participantId);
        return;
      }
      // 이미 피어가 있으면 생성하지 않음
      if (peers.current.has(participantId)) {
        console.log('이미 피어가 존재 (생성 스킵):', participantId);
        return peers.current.get(participantId)!;
      }
      // initiator 분기: 내 userId가 더 작으면 initiator, 아니면 responder
      const initiator = Number(userId) < Number(participantId);
      console.log('새 피어 생성:', participantId, 'initiator:', initiator);
      const peer = new Peer({
        initiator,
        trickle: true, // ICE 후보를 개별적으로 교환
        stream: localStream.current || undefined,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (data: any) => {
        socket.emit('voice:signal', {
          roomId,
          to: Number(participantId), // string → number 변환
          signal: data,
        });
      });

      peer.on('stream', (stream: MediaStream) => {
        setParticipantStreams((prev) => ({ ...prev, [participantId]: stream }));
        // 기존 audioElements 관련 코드는 유지(볼륨 동기화용)
        const audio = new Audio();
        audio.srcObject = stream;
        audio.volume = volume / 100;
        audio.play().catch(console.error);
        audioElements.current.set(participantId, audio);
      });

      peer.on('close', () => {
        console.log('피어 연결 종료:', participantId);
        // 피어 연결 정리
        peers.current.delete(participantId);
        // 오디오 요소 정리
        const audioElement = audioElements.current.get(participantId);
        if (audioElement) {
          audioElement.remove();
          audioElements.current.delete(participantId);
        }
      });

      peer.on('error', (err) => {
        console.error('피어 연결 에러:', participantId, err);
      });

      peer.on('connect', () => {
        console.log('피어 연결 성공:', participantId);
        // 데이터 채널 닫기
        // if ((peer as any)._channel) {
        //   try {
        //     (peer as any)._channel.close();
        //     console.log('데이터 채널 닫음:', participantId);
        //   } catch (e) {
        //     console.warn('데이터 채널 닫기 실패:', participantId, e);
        //   }
        // }
        // ICE 상태 이벤트 바인딩
        const pc = (peer as any)._pc as RTCPeerConnection;
        if (pc) {
          pc.oniceconnectionstatechange = () => {
            console.log('ICE 상태:', pc.iceConnectionState, participantId);
          };
        }
      });

      peers.current.set(participantId, peer);
      return peer;
    },
    [roomId, volume, userId],
  );

  // 음성채팅 이벤트 리스너 설정
  const setupVoiceChatListeners = useCallback(() => {
    // 이미 등록된 리스너가 있으면 제거
    socket.off('voice:user-joined');
    socket.off('voice:signal');
    socket.off('voice:leave');
    socket.off('voice:existing-participants');

    // 새로운 참가자 입장
    const handleVoiceUserJoined = ({
      userId: newUserId,
      userName: newUserName,
      userRole: newUserRole,
    }: {
      userId: number;
      userName: string;
      userRole: 'teacher' | 'student';
    }) => {
      // 내 정보는 제외
      if (String(newUserId) !== userId) {
        const participantId = String(newUserId);
        if (!participantId || participantId === 'undefined') {
          console.warn('잘못된 participantId로 handleVoiceUserJoined, 스킵:', participantId);
          return;
        }
        const peer = peers.current.get(participantId);
        // 중복 체크 강화: 피어가 있거나, 스트림이 있거나, 피어가 연결된 상태면 스킵
        if (
          peer ||
          participantStreams[participantId] ||
          (peer ? (peer as any).connected || (peer as any)._connected : false)
        ) {
          console.log('이미 피어/스트림/연결된 참가자 (스킵):', participantId);
          return;
        }
        const newParticipant: Participant = {
          id: participantId,
          name: newUserName,
          role: newUserRole,
          isMuted: false,
          volume: 100,
        };
        addParticipant(newParticipant);
        createPeer(participantId);
      }
    };

    // 시그널링 데이터 수신
    const handleVoiceSignal = ({ from, signal }: { from: number; signal: any }) => {
      const fromId = String(from);
      let peer = peers.current.get(fromId);
      if (!peer) {
        peer = createPeer(fromId);
      }
      // 이미 연결된 피어면 signal 처리하지 않음
      if (peer && (peer.destroyed || peer.connected)) {
        console.log('이미 연결된 피어 signal 무시:', fromId);
        return;
      }
      if (peer) {
        peer.signal(signal);
      }
    };

    // 참가자 퇴장
    const handleVoiceLeave = ({ userId: leftUserId }: { userId: number }) => {
      console.log('참가자 퇴장 이벤트 수신:', leftUserId, '타입:', typeof leftUserId);
      const participantId = String(leftUserId);
      console.log('변환된 participantId:', participantId);
      removeParticipant(participantId);
    };

    // 기존 참가자 목록 수신
    const handleVoiceExistingParticipants = (
      participants: Array<{
        userId: number;
        userName: string;
        userRole: 'teacher' | 'student';
      }>,
    ) => {
      participants.forEach((participant) => {
        // 내 정보는 제외
        if (String(participant.userId) !== userId) {
          const participantId = String(participant.userId);
          if (!participantId || participantId === 'undefined') {
            console.warn(
              '잘못된 participantId로 handleVoiceExistingParticipants, 스킵:',
              participantId,
            );
            return;
          }
          const peer = peers.current.get(participantId);
          // 중복 체크 강화: 피어가 있거나, 스트림이 있거나, 피어가 연결된 상태면 스킵
          if (
            peer ||
            participantStreams[participantId] ||
            (peer && ((peer as any).connected || (peer as any)._connected))
          ) {
            console.log('기존 참가자 피어/스트림/연결된 참가자 (스킵):', participantId);
            return;
          }
          const newParticipant: Participant = {
            id: participantId,
            name: participant.userName,
            role: participant.userRole,
            isMuted: false,
            volume: 100,
          };
          addParticipant(newParticipant);
          createPeer(participantId);
        }
      });
    };

    // 이벤트 리스너 등록
    socket.on('voice:user-joined', handleVoiceUserJoined);
    socket.on('voice:signal', handleVoiceSignal);
    socket.on('voice:leave', handleVoiceLeave);
    socket.on('voice:existing-participants', handleVoiceExistingParticipants);

    // 클린업 함수 반환
    return () => {
      socket.off('voice:user-joined', handleVoiceUserJoined);
      socket.off('voice:signal', handleVoiceSignal);
      socket.off('voice:leave', handleVoiceLeave);
      socket.off('voice:existing-participants', handleVoiceExistingParticipants);
    };
  }, [roomId, userId, userName, userRole, addParticipant, removeParticipant, createPeer]);

  // 컴포넌트 마운트 시 이벤트 리스너 등록 및 언마운트 시 정리
  useEffect(() => {
    // 이벤트 리스너 등록
    const cleanup = setupVoiceChatListeners();

    return () => {
      cleanup();
      // 연결 정리
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      peers.current.forEach((peer) => peer.destroy());
      peers.current.clear();
      audioElements.current.forEach((audio) => audio.remove());
      audioElements.current.clear();
      setParticipantStreams({}); // 참여자 스트림 목록 초기화
    };
  }, [setupVoiceChatListeners]);

  // 볼륨 동기화용 useEffect
  useEffect(() => {
    audioElements.current.forEach((audio) => {
      audio.volume = volume / 100;
    });
  }, [volume]);

  // participants에 stream을 붙여서 반환
  const participantsWithStream = participants.map((p) => ({
    ...p,
    stream: participantStreams[p.id],
  }));

  return {
    // 내 상태
    isEnabled,
    isMuted,
    volume,
    toggleEnabled,
    toggleMute,
    handleVolumeChange,

    // 참여자 관리
    participants: participantsWithStream,
    toggleParticipantMute,
    handleParticipantVolumeChange,

    // 연결 상태
    isConnected: voiceConnected,
  };
};
