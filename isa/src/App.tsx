/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ChatScreen from './components/ChatScreen';

export default function App() {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#080B10] text-white relative overflow-hidden font-sans">
      {/* Ambient Lighting Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-20%] w-[80%] h-[50%] bg-[#0d518E]/30 blur-[130px] rounded-full animate-float-slow" />
        <div className="absolute bottom-[10%] right-[-20%] w-[70%] h-[60%] bg-[#fab515]/15 blur-[140px] rounded-full animate-float" />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-hidden flex flex-col">
        <ChatScreen />
      </main>
    </div>
  );
}
