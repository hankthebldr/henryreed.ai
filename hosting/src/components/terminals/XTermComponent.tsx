import { useRef, useEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const XTermComponent = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xterm = useRef<Terminal | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      xterm.current = new Terminal();
      const fitAddon = new FitAddon();
      xterm.current.loadAddon(fitAddon);
      xterm.current.open(terminalRef.current);
      fitAddon.fit();

      xterm.current.writeln('Hello from XTerm.js embedded in React!');

      return () => xterm.current?.dispose();
    }
  }, []);

  return <div className="xterm" ref={terminalRef} style={{ width: '100%', height: '100%' }} />;
};

export default XTermComponent;

