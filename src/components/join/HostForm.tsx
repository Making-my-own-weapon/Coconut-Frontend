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
      <label
        htmlFor="className"
        className="block text-sm font-medium text-gray-700"
      >
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
      <label
        htmlFor="maxParticipants"
        className="block text-sm font-medium text-gray-700"
      >
        최대 참여자수
      </label>
      <input
        id="maxParticipants"
        type="number"
        value={maxParticipants}
        onChange={(e) => setMaxParticipants(Number(e.target.value))}
        className="mt-1 w-full border rounded-md p-2 h-10"
        required
      />
    </div>
  </div>
);

export default HostForm;
