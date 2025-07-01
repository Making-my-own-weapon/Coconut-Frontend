import HostActionContainer from '../components/join/HostActionContainer';
import GuestActionContainer from '../components/join/GuestActionContainer';
import HeaderLogout from '../components/common/HeaderLogout';

const JoinPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <HeaderLogout />
      <div className="flex flex-col items-center mt-[70px]">
        <div className="w-full max-w-4xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <HostActionContainer />
            <GuestActionContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
