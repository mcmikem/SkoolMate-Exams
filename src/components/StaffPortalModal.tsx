import React, { useState } from 'react';
import {
  X,
  Shield,
  KeyRound,
  Send,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Unlock,
  Radio,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { TelegramConfig } from '../types/exam';

interface StaffPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onUpdateConfig: (newConfig: Partial<TelegramConfig>) => Promise<void>;
  onTestConnection: (token: string, channel: string) => Promise<{ success: boolean; message: string; botInfo?: any }>;
  onSyncNow: () => Promise<void>;
  onSimulateIngest: (subject: 'chemistry' | 'math') => Promise<void>;
  onOpenUploadPdf: () => void;
  isSyncing: boolean;
  isStaffMode: boolean;
  onToggleStaffMode: (enabled: boolean) => void;
}

export const StaffPortalModal: React.FC<StaffPortalModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTestConnection,
  onSyncNow,
  onSimulateIngest,
  onOpenUploadPdf,
  isSyncing,
  isStaffMode,
  onToggleStaffMode,
}) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Form states
  const [botToken, setBotToken] = useState(config.botToken);
  const [channelUsername, setChannelUsername] = useState(config.channelUsername);
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleTestBot = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(botToken, channelUsername);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateConfig({
        botToken: botToken.trim(),
        channelUsername: channelUsername.trim(),
        autoSync,
      });
      setTestResult({ success: true, message: 'Settings saved successfully' });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#001f3f]/70 backdrop-blur-md animate-fade-in text-[#171717]">
      <div className="bg-white border border-[#d9e7fb] rounded-[24px] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d9e7fb] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#001f3f] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-[#005ce6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base text-[#001f3f]">
                  Staff & Administrative Control Room
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f4f7fd] text-[#5b6576] border border-[#d9e7fb]">
                  Restricted
                </span>
              </div>
              <p className="text-[11px] text-[#5b6576]">
                Configure past paper sources, sync channels, and manage exam catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#edf3fd] text-[#7b8698] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Authentication Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#eef4ff] text-[#005ce6] flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="max-w-sm">
              <h3 className="font-heading font-extrabold text-lg text-[#001f3f]">
                Teacher & Administrator Passcode
              </h3>
              <p className="text-xs text-[#5b6576] mt-1">
                This area is reserved for school administrators to manage background exam ingestion and Telegram channel feeds. Students do not need access here.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter PIN (Default: 1234)"
                  className={`w-full px-4 py-2.5 rounded-xl border text-center text-sm font-bold tracking-widest outline-none transition-all ${
                    pinError
                      ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#d9e7fb] bg-[#f8fbff] text-[#001f3f] focus:border-[#005ce6] focus:bg-white focus:ring-2 focus:ring-[#005ce6]/15'
                  }`}
                  autoFocus
                />
              </div>

              {pinError && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Incorrect PIN. Use 1234
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#005ce6] hover:bg-[#004ec2] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Control Room</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Staff Console */
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-[#313131]">
            {/* Quick Mode Toggles */}
            <div className="p-4 rounded-2xl bg-[#f4f7fd] border border-[#d9e7fb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#001f3f] flex items-center gap-1.5 text-xs">
                  <Sliders className="w-4 h-4 text-[#005ce6]" />
                  Exam Paper Editing Mode
                </span>
                <p className="text-[11px] text-[#5b6576] mt-0.5">
                  Allows teachers to edit questions, marking rubrics, and model answers directly on cards.
                </p>
              </div>
              <button
                onClick={() => onToggleStaffMode(!isStaffMode)}
                className={`px-3 py-1.5 rounded-full font-bold text-xs cursor-pointer transition-colors shrink-0 ${
                  isStaffMode
                    ? 'bg-[#005ce6] text-white'
                    : 'bg-white text-[#5b6576] border border-[#d9e7fb] hover:bg-[#edf3fd]'
                }`}
              >
                {isStaffMode ? '✓ Editing Enabled' : 'Enable Editor'}
              </button>
            </div>

            {/* Telegram Channel Connector */}
            <div className="p-5 rounded-2xl bg-white border border-[#d9e7fb] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#eef4ff] text-[#005ce6] flex items-center justify-center font-bold">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#001f3f] text-sm">Telegram Channel Ingestion</h4>
                    <p className="text-[11px] text-[#5b6576]">
                      The channel where your school or teachers share past papers and holiday packages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      config.isConnected ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-[#5b6576]">
                    {config.isConnected ? 'Channel Active' : 'Not Connected'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#001f3f]">Telegram Bot Token</label>
                  <input
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="e.g. 7123456789:AAFxz_..."
                    className="w-full px-3 py-2 rounded-xl border border-[#d9e7fb] bg-[#f8fbff] text-xs font-mono outline-none focus:border-[#005ce6] focus:bg-white"
                  />
                  <p className="text-[10px] text-[#7b8698]">
                    Obtained by creating a bot via <code className="font-bold">@BotFather</code> on Telegram. Add this bot as an admin with "read messages" rights in your past papers channel.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#001f3f]">Channel Username or ID</label>
                  <input
                    type="text"
                    value={channelUsername}
                    onChange={(e) => setChannelUsername(e.target.value)}
                    placeholder="e.g. @uganda_past_papers or -1001234567890"
                    className="w-full px-3 py-2 rounded-xl border border-[#d9e7fb] bg-[#f8fbff] text-xs font-mono outline-none focus:border-[#005ce6] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="rounded border-[#d9e7fb] text-[#005ce6] focus:ring-[#005ce6] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="autoSync" className="text-xs font-medium text-[#001f3f] cursor-pointer">
                    Automatically convert newly uploaded PDFs when posted to the channel
                  </label>
                </div>

                {testResult && (
                  <div
                    className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[11px] font-medium leading-relaxed">{testResult.message}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestBot}
                    disabled={isTesting || !botToken.trim()}
                    className="btn-secondary !text-xs !py-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? 'Testing Link...' : 'Test Channel Link'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary !text-xs !py-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>

                  <button
                    type="button"
                    onClick={onSyncNow}
                    disabled={isSyncing || !config.isConnected}
                    className="ml-auto card-action-pill !bg-[#edf3fd] !text-[#005ce6] !border-[#b0ccf7] cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Checking Telegram...' : 'Poll Channel Now'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Direct PDF & Simulation Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Direct PDF Converter */}
              <div className="p-4 rounded-2xl bg-white border border-[#d9e7fb] space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#005ce6]" />
                  <h4 className="font-bold text-[#001f3f]">Upload Past Paper PDF</h4>
                </div>
                <p className="text-[11px] text-[#5b6576]">
                  Upload a scanned past paper PDF directly from your computer without posting to Telegram first.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUploadPdf();
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-[#edf3fd] hover:bg-[#d9e7fb] text-[#005ce6] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Choose PDF File</span>
                </button>
              </div>

              {/* Demo Ingest Simulator */}
              <div className="p-4 rounded-2xl bg-white border border-[#d9e7fb] space-y-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#005ce6]" />
                  <h4 className="font-bold text-[#001f3f]">Simulate Channel Drop</h4>
                </div>
                <p className="text-[11px] text-[#5b6576]">
                  Test the automatic conversion pipeline by injecting a real UNEB exam paper sample.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSimulateIngest('chemistry')}
                    disabled={isSyncing}
                    className="flex-1 py-2 rounded-xl bg-[#eef4ff] hover:bg-[#d9e7fb] text-[#005ce6] font-bold text-[11px] cursor-pointer disabled:opacity-50"
                  >
                    + UCE Chemistry
                  </button>
                  <button
                    onClick={() => onSimulateIngest('math')}
                    disabled={isSyncing}
                    className="flex-1 py-2 rounded-xl bg-[#eef4ff] hover:bg-[#d9e7fb] text-[#005ce6] font-bold text-[11px] cursor-pointer disabled:opacity-50"
                  >
                    + P.7 Science
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#d9e7fb] bg-[#f8fbff] flex items-center justify-between text-[11px] text-[#7b8698]">
          <span>SkoolMate Administrative Console • Confidential</span>
          <button
            onClick={onClose}
            className="font-bold text-[#001f3f] hover:text-[#005ce6] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
