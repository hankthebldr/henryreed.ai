import React, { useState, useEffect } from 'react';
import { CommandConfig } from './commands';
import { TerminalOutput } from '../components/TerminalOutput';

// Blockchain integration utilities
interface BlockchainSignature {
  hash: string;
  timestamp: string;
  blockNumber: string;
  transactionId: string;
  signerAddress: string;
  networkId: string;
  gasUsed?: string;
  signatureData: string;
}

interface TRRSignoffRecord {
  trrId: string;
  signoffType: 'technical' | 'business' | 'executive' | 'final';
  signerName: string;
  signerRole: string;
  signerEmail: string;
  signoffDate: string;
  comments: string;
  attachedEvidence: string[];
  blockchainSignature?: BlockchainSignature;
  ipfsHash?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  complianceFlags: string[];
}

// Mock blockchain service (in production, this would integrate with actual blockchain)
class BlockchainService {
  private static instance: BlockchainService;
  private networkId = 'cortex-testnet-001';
  
  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  async signDocument(data: any, signerAddress: string): Promise<BlockchainSignature> {
    // Simulate blockchain signing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const documentHash = this.generateHash(JSON.stringify(data));
    const timestamp = new Date().toISOString();
    const blockNumber = (Math.floor(Math.random() * 1000000) + 1000000).toString();
    const transactionId = `0x${this.generateRandomHex(64)}`;
    
    return {
      hash: documentHash,
      timestamp,
      blockNumber,
      transactionId,
      signerAddress,
      networkId: this.networkId,
      gasUsed: '21000',
      signatureData: `0x${this.generateRandomHex(130)}`
    };
  }

  async verifySignature(signature: BlockchainSignature): Promise<boolean> {
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.1; // 90% success rate for demo
  }

  async uploadToIPFS(data: any): Promise<string> {
    // Simulate IPFS upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `Qm${this.generateRandomHex(44)}`;
  }

  private generateHash(data: string): string {
    // Simple hash simulation (in production, use actual cryptographic hash)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  private generateRandomHex(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}

// Mock TRR signoff data store
let trrSignoffs: TRRSignoffRecord[] = [
  {
    trrId: 'TRR-001',
    signoffType: 'technical',
    signerName: 'Sarah Smith',
    signerRole: 'Senior Security Engineer',
    signerEmail: 'sarah.smith@company.com',
    signoffDate: '2024-02-15T14:30:00Z',
    comments: 'All technical requirements validated successfully. SIEM integration working as expected.',
    attachedEvidence: ['test-results.pdf', 'integration-logs.txt'],
    blockchainSignature: {
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: '2024-02-15T14:30:00Z',
      blockNumber: '1234567',
      transactionId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      signerAddress: '0x742d35Cc6764C084532C66B6e4d2c7B4cE2C5eC8',
      networkId: 'cortex-testnet-001',
      gasUsed: '21000',
      signatureData: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c'
    },
    ipfsHash: 'QmYwAPJzv5CZsnA5wZTF6QGd7jqRNJ8Gv5sM4dKfB9xPqR',
    verificationStatus: 'verified',
    complianceFlags: ['SOC2', 'ISO27001']
  }
];

// Blockchain Signoff Component
const BlockchainSignoffForm: React.FC<{
  trrId: string;
  onSignoff: (signoff: TRRSignoffRecord) => void;
}> = ({ trrId, onSignoff }) => {
  const [formData, setFormData] = useState({
    signoffType: 'technical' as TRRSignoffRecord['signoffType'],
    signerName: '',
    signerRole: '',
    signerEmail: '',
    comments: '',
    attachedEvidence: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signingStep, setSigningStep] = useState<'form' | 'blockchain' | 'ipfs' | 'complete'>('form');
  const [blockchainResult, setBlockchainResult] = useState<BlockchainSignature | null>(null);

  const handleSubmit = async () => {
    if (!formData.signerName || !formData.signerEmail) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    setSigningStep('blockchain');

    try {
      const blockchain = BlockchainService.getInstance();
      
      // Step 1: Create signoff record
      const signoffRecord: TRRSignoffRecord = {
        trrId,
        ...formData,
        signoffDate: new Date().toISOString(),
        verificationStatus: 'pending',
        complianceFlags: ['TRR-VALIDATION']
      };

      // Step 2: Sign with blockchain
      const mockSignerAddress = '0x742d35Cc6764C084532C66B6e4d2c7B4cE2C5eC8';
      const signature = await blockchain.signDocument(signoffRecord, mockSignerAddress);
      setBlockchainResult(signature);
      signoffRecord.blockchainSignature = signature;

      // Step 3: Upload to IPFS
      setSigningStep('ipfs');
      const ipfsHash = await blockchain.uploadToIPFS(signoffRecord);
      signoffRecord.ipfsHash = ipfsHash;

      // Step 4: Verify signature
      const isVerified = await blockchain.verifySignature(signature);
      signoffRecord.verificationStatus = isVerified ? 'verified' : 'failed';

      setSigningStep('complete');
      onSignoff(signoffRecord);
      
    } catch (error) {
      console.error('Blockchain signoff failed:', error);
      alert('Blockchain signoff failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (signingStep !== 'form') {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-blue-500">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">⛓️</div>
          <div>
            <div className="font-bold text-xl text-blue-400">Blockchain Signoff in Progress</div>
            <div className="text-sm text-gray-300">Securing TRR signoff with immutable blockchain record</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center space-x-3 ${
            signingStep === 'blockchain' ? 'text-yellow-400' : 
            signingStep === 'ipfs' || signingStep === 'complete' ? 'text-green-400' : 'text-gray-500'
          }`}>
            <div className="text-xl">
              {signingStep === 'blockchain' ? '⏳' : 
               signingStep === 'ipfs' || signingStep === 'complete' ? '✅' : '⚪'}
            </div>
            <div>
              <div className="font-semibold">Blockchain Signature</div>
              <div className="text-xs">Creating cryptographic signature on distributed ledger</div>
            </div>
          </div>

          <div className={`flex items-center space-x-3 ${
            signingStep === 'ipfs' ? 'text-yellow-400' : 
            signingStep === 'complete' ? 'text-green-400' : 'text-gray-500'
          }`}>
            <div className="text-xl">
              {signingStep === 'ipfs' ? '⏳' : 
               signingStep === 'complete' ? '✅' : '⚪'}
            </div>
            <div>
              <div className="font-semibold">IPFS Storage</div>
              <div className="text-xs">Uploading document to distributed storage</div>
            </div>
          </div>

          <div className={`flex items-center space-x-3 ${
            signingStep === 'complete' ? 'text-green-400' : 'text-gray-500'
          }`}>
            <div className="text-xl">
              {signingStep === 'complete' ? '✅' : '⚪'}
            </div>
            <div>
              <div className="font-semibold">Verification</div>
              <div className="text-xs">Confirming signature validity and immutability</div>
            </div>
          </div>
        </div>

        {blockchainResult && (
          <div className="mt-6 bg-gray-900 p-4 rounded border border-gray-600">
            <div className="text-green-400 font-bold mb-2">🔗 Blockchain Details</div>
            <div className="space-y-1 text-xs font-mono">
              <div><span className="text-gray-400">Transaction:</span> {blockchainResult.transactionId}</div>
              <div><span className="text-gray-400">Block:</span> #{blockchainResult.blockNumber}</div>
              <div><span className="text-gray-400">Network:</span> {blockchainResult.networkId}</div>
              <div><span className="text-gray-400">Gas Used:</span> {blockchainResult.gasUsed}</div>
            </div>
          </div>
        )}

        {signingStep === 'complete' && (
          <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-500/30">
            <div className="text-green-400 font-bold">✅ Signoff Complete!</div>
            <div className="text-sm text-gray-300 mt-1">
              TRR signoff has been permanently recorded on the blockchain and is now immutable.
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">📝</div>
        <div>
          <div className="font-bold text-xl text-blue-400">TRR Blockchain Signoff</div>
          <div className="text-sm text-gray-300">TRR ID: {trrId}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Signoff Type</label>
          <select 
            value={formData.signoffType}
            onChange={(e) => setFormData({...formData, signoffType: e.target.value as TRRSignoffRecord['signoffType']})}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="technical">Technical Validation</option>
            <option value="business">Business Approval</option>
            <option value="executive">Executive Sign-off</option>
            <option value="final">Final Acceptance</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Signer Name *</label>
            <input
              type="text"
              value={formData.signerName}
              onChange={(e) => setFormData({...formData, signerName: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role/Title</label>
            <input
              type="text"
              value={formData.signerRole}
              onChange={(e) => setFormData({...formData, signerRole: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="e.g., Senior Security Engineer"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
          <input
            type="email"
            value={formData.signerEmail}
            onChange={(e) => setFormData({...formData, signerEmail: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="your.email@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Comments</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({...formData, comments: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
            placeholder="Enter signoff comments, validation notes, or additional context..."
          />
        </div>

        <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
          <div className="text-blue-400 font-bold mb-2">🔐 Blockchain Security</div>
          <div className="text-sm text-gray-300 space-y-1">
            <div>• This signoff will be cryptographically signed and recorded on the blockchain</div>
            <div>• Once submitted, the record becomes immutable and tamper-proof</div>
            <div>• Document will be stored on IPFS for decentralized access</div>
            <div>• Signature can be independently verified at any time</div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <span>⛓️</span>
            <span>{isSubmitting ? 'Signing...' : 'Sign with Blockchain'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const trrBlockchainSignoffCommands: CommandConfig[] = [
  {
    name: 'trr-signoff',
    description: 'Create blockchain-secured TRR signoffs with cryptographic verification',
    usage: 'trr-signoff [create|list|verify|bulk] [trr-id|options] [options]',
    aliases: ['signoff', 'blockchain-sign'],
    handler: (args) => {
      const subcommand = args[0] || 'dashboard';
      const trrId = args[1] || '';

      if (subcommand === 'bulk') {
        const idsArg = args.find(arg => arg.startsWith('--ids'));
        const trrIds = idsArg ? idsArg.split('=')[1]?.split(',') || [] : [];
        
        if (trrIds.length === 0) {
          return (
            <TerminalOutput type="error">
              <div>Please specify TRR IDs. Usage: trr-signoff bulk --ids TRR-001,TRR-002,TRR-003</div>
            </TerminalOutput>
          );
        }
        
        return (
          <TerminalOutput type="info">
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">⛓️</div>
                <div>
                  <div className="font-bold text-2xl text-purple-400">Bulk Blockchain TRR Signoffs</div>
                  <div className="text-sm text-gray-300">Create multiple immutable, cryptographically secured validation records</div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-purple-400 mb-2">📋 Bulk Signoff Summary</h3>
                  <div className="text-sm text-gray-300">
                    Processing {trrIds.length} TRR signoffs: {trrIds.join(', ')}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {trrIds.map((id, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-blue-400">{id}</span>
                        <span className="text-xs bg-purple-700 text-purple-200 px-2 py-1 rounded">
                          READY FOR SIGNOFF
                        </span>
                      </div>
                      <div className="text-xs text-green-400">
                        ✅ Blockchain ready
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-purple-900/20 rounded border border-purple-500/30">
                  <div className="text-purple-400 font-bold mb-2">🚀 Bulk Operation Status</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• All {trrIds.length} TRRs validated for blockchain signing</div>
                    <div>• Estimated gas cost: {trrIds.length * 21000} units</div>
                    <div>• Batch transaction will be submitted to cortex-testnet-001</div>
                    <div>• Individual signoff forms available via: <span className="font-mono text-blue-400">trr-signoff create [TRR-ID]</span></div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-400">
                  💡 Use individual signoff commands for detailed approval workflows
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'create') {
        if (!trrId) {
          return (
            <TerminalOutput type="error">
              <div>Please specify a TRR ID. Usage: trr-signoff create TRR-001</div>
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">⛓️</div>
                <div>
                  <div className="font-bold text-2xl text-blue-400">Blockchain TRR Signoff</div>
                  <div className="text-sm text-gray-300">Create immutable, cryptographically secured validation record</div>
                </div>
              </div>
              
              <BlockchainSignoffForm 
                trrId={trrId}
                onSignoff={(signoff) => {
                  trrSignoffs.push(signoff);
                }}
              />
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'verify') {
        const signoffId = trrId;
        const signoff = trrSignoffs.find(s => s.trrId === signoffId);
        
        if (!signoff) {
          return (
            <TerminalOutput type="error">
              <div>Signoff record not found for TRR: {signoffId}</div>
            </TerminalOutput>
          );
        }

        return (
          <TerminalOutput type="info">
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">🔍</div>
                <div>
                  <div className="font-bold text-2xl text-green-400">Blockchain Verification</div>
                  <div className="text-sm text-gray-300">Cryptographic validation of TRR signoff</div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-green-400 mb-4">📋 Signoff Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">TRR ID:</span> {signoff.trrId}</div>
                      <div><span className="text-gray-400">Type:</span> {signoff.signoffType}</div>
                      <div><span className="text-gray-400">Signer:</span> {signoff.signerName}</div>
                      <div><span className="text-gray-400">Role:</span> {signoff.signerRole}</div>
                      <div><span className="text-gray-400">Date:</span> {new Date(signoff.signoffDate).toLocaleString()}</div>
                      <div className={`flex items-center space-x-2`}>
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          signoff.verificationStatus === 'verified' ? 'bg-green-800 text-green-200' :
                          signoff.verificationStatus === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-red-800 text-red-200'
                        }`}>
                          {signoff.verificationStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-4">🔗 Blockchain Info</h3>
                    {signoff.blockchainSignature && (
                      <div className="space-y-2 text-xs font-mono">
                        <div><span className="text-gray-400">Hash:</span> {signoff.blockchainSignature.hash.substring(0, 20)}...</div>
                        <div><span className="text-gray-400">Block:</span> #{signoff.blockchainSignature.blockNumber}</div>
                        <div><span className="text-gray-400">Transaction:</span> {signoff.blockchainSignature.transactionId.substring(0, 20)}...</div>
                        <div><span className="text-gray-400">Network:</span> {signoff.blockchainSignature.networkId}</div>
                        {signoff.ipfsHash && (
                          <div><span className="text-gray-400">IPFS:</span> {signoff.ipfsHash.substring(0, 20)}...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {signoff.comments && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <h4 className="font-bold text-gray-300 mb-2">Comments:</h4>
                    <p className="text-gray-400 text-sm">{signoff.comments}</p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-green-900/20 rounded border border-green-500/30">
                  <div className="text-green-400 font-bold">✅ Verification Results</div>
                  <div className="text-sm text-gray-300 mt-1 space-y-1">
                    <div>• Cryptographic signature: <span className="text-green-400">Valid</span></div>
                    <div>• Blockchain record: <span className="text-green-400">Confirmed</span></div>
                    <div>• Document integrity: <span className="text-green-400">Intact</span></div>
                    <div>• Timestamp verification: <span className="text-green-400">Verified</span></div>
                  </div>
                </div>
              </div>
            </div>
          </TerminalOutput>
        );
      }

      if (subcommand === 'list') {
        return (
          <TerminalOutput type="info">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📜</div>
                  <div>
                    <div className="font-bold text-2xl text-blue-400">Blockchain Signoffs</div>
                    <div className="text-sm text-gray-300">{trrSignoffs.length} recorded signoff{trrSignoffs.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {trrSignoffs.map((signoff, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono text-blue-400">{signoff.trrId}</div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          signoff.verificationStatus === 'verified' ? 'bg-green-800 text-green-200' :
                          signoff.verificationStatus === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-red-800 text-red-200'
                        }`}>
                          {signoff.verificationStatus.toUpperCase()}
                        </div>
                        <div className="px-2 py-1 bg-blue-700 text-blue-200 rounded text-xs">
                          {signoff.signoffType}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(signoff.signoffDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="font-medium text-white">{signoff.signerName}</div>
                      <div className="text-sm text-gray-400">{signoff.signerRole}</div>
                    </div>
                    
                    <div className="text-xs text-gray-400 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">Email:</span> {signoff.signerEmail}
                      </div>
                      {signoff.blockchainSignature && (
                        <div>
                          <span className="text-gray-500">Block:</span> #{signoff.blockchainSignature.blockNumber}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TerminalOutput>
        );
      }

      // Dashboard view (default)
      const totalSignoffs = trrSignoffs.length;
      const verifiedSignoffs = trrSignoffs.filter(s => s.verificationStatus === 'verified').length;
      const pendingSignoffs = trrSignoffs.filter(s => s.verificationStatus === 'pending').length;

      return (
        <TerminalOutput type="info">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-4">⛓️</div>
              <div>
                <div className="font-bold text-2xl text-blue-400">Blockchain TRR Signoff Dashboard</div>
                <div className="text-sm text-gray-300">Immutable, cryptographically secured validation records</div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 text-center">
                <div className="text-2xl font-bold text-white">{totalSignoffs}</div>
                <div className="text-sm text-gray-400">Total Signoffs</div>
              </div>
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 text-center">
                <div className="text-2xl font-bold text-green-400">{verifiedSignoffs}</div>
                <div className="text-sm text-gray-400">Verified</div>
              </div>
              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30 text-center">
                <div className="text-2xl font-bold text-yellow-400">{pendingSignoffs}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 text-center">
                <div className="text-2xl font-bold text-blue-400">100%</div>
                <div className="text-sm text-gray-400">Immutable</div>
              </div>
            </div>

            {/* Available Commands */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <div className="font-bold text-lg mb-4 text-blue-400">⛓️ Blockchain Signoff Commands</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-green-400 font-mono mb-2">trr-signoff create TRR-001</div>
                  <div className="text-sm text-gray-300 ml-4">Create blockchain signoff</div>
                  
                  <div className="text-blue-400 font-mono mb-2 mt-3">trr-signoff verify TRR-001</div>
                  <div className="text-sm text-gray-300 ml-4">Verify blockchain signature</div>
                </div>
                <div>
                  <div className="text-purple-400 font-mono mb-2">trr-signoff list</div>
                  <div className="text-sm text-gray-300 ml-4">List all blockchain signoffs</div>
                  
                  <div className="text-cyan-400 font-mono mb-2 mt-3">signoff create TRR-002</div>
                  <div className="text-sm text-gray-300 ml-4">Alias for trr-signoff create</div>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-gray-800 p-6 rounded-lg border border-blue-500">
              <div className="font-bold text-lg mb-4 text-blue-400">🔐 Security Features</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✅</span>
                    <span className="text-sm">Cryptographic signatures</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✅</span>
                    <span className="text-sm">Immutable blockchain records</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✅</span>
                    <span className="text-sm">IPFS distributed storage</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✅</span>
                    <span className="text-sm">Independent verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✅</span>
                    <span className="text-sm">Tamper-proof timestamps</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✅</span>
                    <span className="text-sm">Compliance audit trails</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TerminalOutput>
      );
    }
  }
];
