//src/components/join/HostForm.tsx
import React from 'react';

interface HostFormProps {
  title: string;
  maxParticipants: number;
  setTitle: (v: string) => void;
  setMaxParticipants: (v: number) => void;
}

const HostForm: React.FC<HostFormProps> = ({
  title,
  maxParticipants,
  setTitle,
  setMaxParticipants,
}) => (
  <div className="space-y-4">
    <div>
      <label htmlFor="className" className="block text-sm font-medium text-gray-700">
        수업 이름
      </label>
      <input
        id="className"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-1 w-full border rounded-md p-2 h-10"
        required
      />
    </div>
    <div>
      <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
        최대 참여자수
      </label>
      <input
        id="maxParticipants"
        type="number"
        min="1"
        max="4"
        value={maxParticipants}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value >= 1 && value <= 4) {
            setMaxParticipants(value);
          }
        }}
        className="mt-1 w-full border rounded-md p-2 h-10"
        required
      />
      <p className="text-xs text-gray-500 mt-1">1명 ~ 4명 사이로 입력해주세요</p>
    </div>
  </div>
);

export default HostForm;
