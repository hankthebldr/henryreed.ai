import { useState, useEffect } from 'react';

const ArwesDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [systemStats, setSystemStats] = useState({
    cpu: 42,
    memory: 68,
    network: 23,
    uptime: '127h 32m',
  });

  useEffect(() => {
    setAnimate(true);
    
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-hack-background p-6 arwes-theme">
      <div className={`transition-all duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          
          {/* System Status Panel */}
          <div className="border border-terminal-green rounded-lg p-4 bg-hack-surface">
            <h2 className="text-terminal-green mb-4 glitch-text text-xl font-mono">
              SYSTEM STATUS
            </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-terminal-cyan">CPU:</span>
                  <div className="w-32 bg-hack-surface rounded-full h-2">
                    <div 
                      className="bg-terminal-green h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${systemStats.cpu}%` }}
                    />
                  </div>
                  <span className="text-terminal-amber">{systemStats.cpu}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-terminal-cyan">MEM:</span>
                  <div className="w-32 bg-hack-surface rounded-full h-2">
                    <div 
                      className="bg-terminal-green h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${systemStats.memory}%` }}
                    />
                  </div>
                  <span className="text-terminal-amber">{systemStats.memory}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-terminal-cyan">NET:</span>
                  <div className="w-32 bg-hack-surface rounded-full h-2">
                    <div 
                      className="bg-terminal-green h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${systemStats.network}%` }}
                    />
                  </div>
                  <span className="text-terminal-amber">{systemStats.network}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-terminal-green">
                  <span className="text-terminal-cyan">UPTIME:</span>
                  <span className="text-terminal-green font-mono">{systemStats.uptime}</span>
                </div>
              </div>
            </div>

            {/* Terminal Access Panel */}
            <div className="border border-terminal-green rounded-lg p-4 bg-hack-surface">
              <h2 className="text-terminal-green mb-4 glitch-text text-xl font-mono">
                ACCESS TERMINALS
              </h2>
              <div className="space-y-3">
                <a 
                  href="/terminal"
                  className="block w-full bg-transparent border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-hack-background transition-all duration-300 text-center py-2 rounded font-mono"
                >
                  XTERM EMULATOR
                </a>
                <a 
                  href="/cli"
                  className="block w-full bg-transparent border border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-hack-background transition-all duration-300 text-center py-2 rounded font-mono"
                >
                  CLI INTERFACE
                </a>
                <a 
                  href="/console"
                  className="block w-full bg-transparent border border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-hack-background transition-all duration-300 text-center py-2 rounded font-mono"
                >
                  CONSOLE ACCESS
                </a>
              </div>
            </div>

            {/* Data Stream Panel */}
            <div className="border border-terminal-green rounded-lg p-4 bg-hack-surface">
              <h2 className="text-terminal-green mb-4 glitch-text text-xl font-mono">
                DATA STREAM
              </h2>
              <div className="h-64 overflow-y-auto font-mono text-xs">
                <div className="space-y-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="flex justify-between text-terminal-green opacity-80">
                      <span>[{new Date().toLocaleTimeString()}]</span>
                      <span>0x{Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
                      <span className="text-terminal-cyan">OK</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Network Status Panel */}
            <div className="border border-terminal-green rounded-lg p-4 bg-hack-surface col-span-full">
              <h2 className="text-terminal-green mb-4 glitch-text text-xl font-mono">
                NETWORK TOPOLOGY
              </h2>
              <div className="grid grid-cols-4 gap-4 h-32">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="border border-terminal-green rounded p-2 text-center">
                    <div className="text-terminal-cyan text-sm">NODE-{i + 1}</div>
                    <div className="text-terminal-green text-xs mt-1">
                      {Math.random() > 0.5 ? 'ONLINE' : 'STANDBY'}
                    </div>
                    <div className="w-full bg-hack-surface rounded h-1 mt-2">
                      <div 
                        className="bg-terminal-green h-1 rounded animate-pulse"
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Rain Background Effect */}
        <div className="matrix-rain">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="matrix-character"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${20 + Math.random() * 10}s`
              }}
            >
              {String.fromCharCode(0x30A0 + Math.random() * 96)}
            </div>
          ))}
        </div>
      </div>
  );
};

export default ArwesDashboard;
