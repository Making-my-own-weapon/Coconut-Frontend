import React, { useState, useEffect } from 'react';
import microphoneIcon from '../../assets/microphone.svg';

interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  isMuted: boolean;
  volume: number;
  stream?: MediaStream;
}

interface VoiceChatModalProps {
  isOpen: boolean; // 팝업 열림/닫힘
  onClose: () => void; // 팝업 닫기
  isMuted: boolean; // 내 음소거 상태
  onToggleMute: () => void; // 내 음소거 토글
  isEnabled: boolean; // 내 마이크 활성화
  onToggleEnabled: () => void; // 내 마이크 토글
  volume: number; // 내 볼륨
  onVolumeChange: (volume: number) => void; // 내 볼륨 변경
  participants: Participant[]; // 참여자 목록
  onToggleParticipantMute: (id: string) => void; // 참여자 음소거
  onParticipantVolumeChange: (id: string, volume: number) => void; // 참여자 볼륨
  userId: string; // 현재 사용자의 ID
}

const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  isEnabled,
  onToggleEnabled,
  volume,
  onVolumeChange,
  participants,
  onToggleParticipantMute,
  onParticipantVolumeChange,
  userId,
}) => {
  const [localVolume, setLocalVolume] = useState(volume);
  const [previousVolume, setPreviousVolume] = useState(volume); // 이전 볼륨 저장

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  };

  // 음소거 토글 핸들러
  const handleMuteToggle = () => {
    if (localVolume === 0) {
      // 음소거 해제: 이전 볼륨으로 복원
      const restoreVolume = previousVolume > 0 ? previousVolume : 50; // 이전 볼륨이 0이면 50으로 설정
      setLocalVolume(restoreVolume);
      onVolumeChange(restoreVolume);
    } else {
      // 음소거: 현재 볼륨을 저장하고 0으로 설정
      setPreviousVolume(localVolume);
      setLocalVolume(0);
      onVolumeChange(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-6 bg-slate-800 rounded-lg p-4 w-80 shadow-lg border border-slate-600 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">음성채팅 설정</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* 내 마이크 섹션 */}
        <div className="space-y-2 p-3 bg-slate-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">내 마이크</span>
              <button
                onClick={onToggleEnabled}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isEnabled ? '퇴장' : '입장'}
              </button>
            </div>
            {isEnabled && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleMute}
                  className={`p-2 rounded-full transition-colors relative ${
                    isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <img
                    src={microphoneIcon}
                    alt={isMuted ? '마이크 켜기' : '마이크 끄기'}
                    className="h-4 w-4 filter invert"
                  />
                  {/* 마이크 끄기 시 삭선 표시 */}
                  {isMuted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-0.5 bg-black transform -rotate-45"></div>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
          {isEnabled && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">볼륨</span>
                <span className="text-slate-400 text-xs">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}
        </div>

        {/* 구분선 */}
        {isEnabled && <div className="h-px bg-slate-600"></div>}

        {/* 다른 참여자들 섹션 */}
        {isEnabled && (
          <div className="space-y-3">
            <h4 className="text-white font-medium text-sm">다른 참여자들</h4>
            {(() => {
              // 중복 제거 및 자기 자신 제외: id를 기준으로 고유한 참가자만 필터링하고 자기 자신은 제외
              const uniqueParticipants = participants.filter(
                (participant, index, self) =>
                  index === self.findIndex((p) => p.id === participant.id) &&
                  participant.id !== userId, // 자기 자신 제외
              );

              return uniqueParticipants.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">다른 참여자가 없습니다.</p>
              ) : (
                uniqueParticipants.map((participant) => (
                  <div key={participant.id} className="space-y-2 p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{participant.name}</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-300">
                          {participant.role === 'teacher' ? '선생님' : '학생'}
                        </span>
                      </div>
                      <button
                        onClick={() => onToggleParticipantMute(participant.id)}
                        className={`p-2 rounded-full transition-colors relative ${
                          participant.isMuted
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {/* 헤드셋 아이콘 */}
                        <svg
                          className="h-4 w-4 filter invert"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                        {/* 음소거 시 삭선 표시 */}
                        {participant.isMuted && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-0.5 bg-black transform -rotate-45"></div>
                          </div>
                        )}
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">볼륨</span>
                        <span className="text-slate-400 text-xs">{participant.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={participant.volume}
                        onChange={(e) =>
                          onParticipantVolumeChange(participant.id, Number(e.target.value))
                        }
                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <audio
                      ref={(el) => {
                        if (el && participant.stream) {
                          el.srcObject = participant.stream;
                          el.volume = participant.volume / 100;
                          el.muted = participant.isMuted;
                        }
                      }}
                      autoPlay
                      hidden
                    />
                  </div>
                ))
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatModal;
