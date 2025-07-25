import { useRef, useEffect } from 'react';
// TODO: Re-enable when xterm packages are properly installed
// import { Terminal } from '@xterm/xterm';
// import { FitAddon } from '@xterm/addon-fit';
// import '@xterm/xterm/css/xterm.css';

const XTermComponent = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  // const xterm = useRef<Terminal | null>(null);

  useEffect(() => {
    // TODO: Re-enable when xterm packages are properly installed
    console.log('XTermComponent disabled temporarily');
    /*
    if (terminalRef.current) {
      xterm.current = new Terminal();
      const fitAddon = new FitAddon();
      xterm.current.loadAddon(fitAddon);
      xterm.current.open(terminalRef.current);
      fitAddon.fit();

      xterm.current.writeln('Hello from XTerm.js embedded in React!');

      return () => xterm.current?.dispose();
    }
    */
  }, []);

  return (
    <div 
      className="xterm bg-black text-green-500 p-4 font-mono" 
      ref={terminalRef} 
      style={{ width: '100%', height: '100%' }}
    >
      XTerm component temporarily disabled. Install @xterm packages to enable.
    </div>
  );
};

export default XTermComponent;

