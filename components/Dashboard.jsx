import ChatItem from './ChatItem';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Dashboard() {
    return (
        <div className="bg-background h-screen w-screen flex items-center justify-between p-5">
            <Sidebar />
            <div className="p-5 bg-primary rounded-3xl h-full w-full flex items-start justify-between gap-1">
                <div className='w-[30%] h-full flex flex-col items-start justify-start gap-2 overflow-x-hidden overflow-y-auto p-5'>
                    <ChatItem title='General Chat' time='00:00' pin='true' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' pin='true' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' pin='true' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                    <ChatItem title='General Chat' time='00:00' notifications='2' />
                </div>
                <div className='w-[70%] h-full items-start justify-start p-5'>
                    <TopBar title={'General'} members={5} />
                </div>
            </div>
        </div>
    );
}
