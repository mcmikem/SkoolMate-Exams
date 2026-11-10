import React, { useState } from 'react';
import { TelegramConfig } from '../types/exam';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  Copy,
  ShieldCheck,
  Zap,
  UploadCloud,
  FileText,
  Sparkles,
} from 'lucide-react';

interface TelegramHubProps {
  config: TelegramConfig;
  onUpdateConfig: (newConfig: Partial<TelegramConfig>) => Promise<void>;
  onTestConnection: (token: string, channel: string) => Promise<{ success: boolean; message: string; bot?: any }>;
  onSyncNow: () => Promise<void>;
  onSimulateIngest: (subject: 'chemistry' | 'math') => Promise<void>;
  onUploadPdf: (base64: string, fileName: string) => Promise<void>;
  isSyncing: boolean;
}

export const TelegramHub: React.FC<TelegramHubProps> = ({
  config,
  onUpdateConfig,
  onTestConnection,
  onSyncNow,
  onSimulateIngest,
  onUploadPdf,
  isSyncing,
}) => {
  const [botToken, setBotToken] = useState(config.botToken || '');
  const [channelUsername, setChannelUsername] = useState(config.channelUsername || '');
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [pollingInterval, setPollingInterval] = useState(config.pollingIntervalSeconds || 60);

  const [testStatus, setTestStatus] = useState<{ loading: boolean; message?: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const webhookUrl = `${window.location.origin}/api/telegram/webhook`;

  const handleTest = async () => {
    setTestStatus({ loading: true });
    const res = await onTestConnection(botToken, channelUsername);
    setTestStatus({
      loading: false,
      message: res.message,
      isError: !res.success,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateConfig({
        botToken: botToken.trim(),
        channelUsername: channelUsername.trim(),
        autoSync,
        pollingIntervalSeconds: Number(pollingInterval),
      });
      alert('Telegram settings updated successfully.');
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please upload a PDF past paper file.');
      return;
    }
    setUploadingPdf(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await onUploadPdf(base64, file.name);
        setUploadingPdf(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
      setUploadingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in text-[#171717]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm-card p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#edf3fd] border border-[#d9e7fb] flex items-center justify-center text-[#005ce6] shrink-0">
            <Send className="w-6 h-6 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#001f3f] font-heading">Telegram Channel Hub</h1>
              <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#dff7f3] text-[#065f46] border border-[#a2ecd8] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#43b3a3] animate-pulse" />
                Automatic Ingestion Active
              </span>
            </div>
            <p className="text-xs text-[#5b6576] font-medium mt-1">
              Connect your Telegram channel to automatically convert new past papers into digital exams
            </p>
          </div>
        </div>

        <button
          onClick={onSyncNow}
          disabled={isSyncing}
          className="btn btn-primary"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Checking Telegram...' : 'Check Channel Now'}</span>
        </button>
      </div>

      {/* Zero Storage Architecture Callout */}
      <div className="p-5 rounded-3xl bg-[#eef4ff] border border-[#b0ccf7] flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-[#005ce6] text-white shrink-0 shadow-xs">
          <HardDrive className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold text-[#001f3f]">Telegram Cloud Storage Optimization</h4>
          <p className="text-[#313131] leading-relaxed font-medium">
            Original PDF files remain securely stored in Telegram's global cloud network.
            This application doesn't store heavy PDF files on disk; it downloads or streams them on-demand
            and extracts interactive questions and isolated diagrams for student practice.
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Telegram Bot & Channel Form */}
        <div className="lg:col-span-7 sm-card p-6 sm:p-7 space-y-6">
          <div className="border-b border-[#d9e7fb] pb-3">
            <h3 className="font-extrabold text-sm text-[#001f3f] flex items-center gap-2 font-heading">
              <ShieldCheck className="w-4 h-4 text-[#005ce6]" />
              <span>Channel & Bot Connection Setup</span>
            </h3>
            <p className="text-xs text-[#5b6576] font-medium mt-0.5">
              Connect to any public or private Telegram channel
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Telegram Bot Token
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="e.g. 7123456789:AAHq_xyz..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-blue-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Obtained from Telegram's <strong>@BotFather</strong>. The bot must be added as an Administrator in your channel.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Telegram Channel Username or Chat ID
              </label>
              <input
                type="text"
                value={channelUsername}
                onChange={(e) => setChannelUsername(e.target.value)}
                placeholder="@cambridge_pastpapers or -100123456789"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono font-medium"
              />
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Enter the channel @handle (e.g. @past_papers_hub) or channel numeric ID.
              </p>
            </div>

            {/* Auto sync options */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Automatic Channel Polling</span>
                  <span className="text-[11px] text-slate-500 font-medium">Regularly check for newly posted exam PDFs</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Polling Interval (Seconds)
                </label>
                <input
                  type="number"
                  min="15"
                  max="600"
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(Number(e.target.value) || 60)}
                  className="w-28 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Test Status feedback */}
            {testStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                  testStatus.isError
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {testStatus.loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-600" />
                ) : testStatus.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>{testStatus.message || (testStatus.loading ? 'Verifying with Telegram API...' : '')}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={testStatus?.loading}
                className="btn btn-secondary flex-1"
              >
                Test Connection
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>

          {/* Webhook Endpoint section */}
          <div className="pt-4 border-t border-[#d9e7fb] space-y-2">
            <span className="text-xs font-bold text-[#001f3f] block">
              Instant Push Webhook Endpoint (Optional)
            </span>
            <p className="text-[11px] text-[#5b6576] font-medium">
              For instant real-time ingestion when a PDF is sent to the channel, register this webhook:
            </p>
            <div className="flex items-center gap-2 bg-[#f4f7fd] p-2 rounded-xl border border-[#d9e7fb]">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 bg-transparent text-[11px] text-[#171717] font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="card-action-pill !py-1 !px-2.5 text-xs font-semibold"
                title="Copy Webhook URL"
              >
                <Copy className="w-3.5 h-3.5 text-[#005ce6]" />
                <span>{copiedWebhook ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation & Manual Direct Upload */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Simulation Card */}
          <div className="sm-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#8a4508] text-xs font-extrabold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-[#f59e0b]" />
              <span>Simulate Channel Document Post</span>
            </div>
            <p className="text-xs text-[#5b6576] leading-relaxed font-medium">
              See how new exam PDFs sent to your Telegram channel are downloaded and converted into interactive student tests.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onSimulateIngest('chemistry')}
                disabled={isSyncing}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#f4f7fd] border border-[#d9e7fb] hover:border-[#b0ccf7] hover:bg-[#eef4ff] text-xs text-[#171717] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#f3e8ff] text-[#7c3aed]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#001f3f] group-hover:text-[#005ce6]">
                      IB Chemistry HL Paper 2.pdf
                    </div>
                    <span className="text-[10px] text-[#7b8698] font-medium">Includes Titration Curve Diagram</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#005ce6] font-bold">Ingest →</span>
              </button>

              <button
                onClick={() => onSimulateIngest('math')}
                disabled={isSyncing}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#f4f7fd] border border-[#d9e7fb] hover:border-[#b0ccf7] hover:bg-[#eef4ff] text-xs text-[#171717] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#eef4ff] text-[#005ce6]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#001f3f] group-hover:text-[#005ce6]">
                      Digital SAT Math Practice.pdf
                    </div>
                    <span className="text-[10px] text-[#7b8698] font-medium">Algebra & Coordinate Geometry</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#005ce6] font-bold">Ingest →</span>
              </button>
            </div>
          </div>

          {/* Direct PDF Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 text-center space-y-3 transition-colors ${
              dragActive
                ? 'border-[#005ce6] bg-[#eef4ff]'
                : 'border-[#d9e7fb] bg-white hover:border-[#b0ccf7] shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#edf3fd] text-[#005ce6] flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-[#001f3f] font-heading">Upload Past Paper PDF Directly</h4>
              <p className="text-xs text-[#5b6576] font-medium mt-1 max-w-xs mx-auto">
                Drag and drop any exam PDF file here to parse questions and extract diagrams for student testing.
              </p>
            </div>

            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploadingPdf}
              />
              <span className="btn btn-primary !py-2.5 !px-5 inline-flex items-center gap-1.5">
                {uploadingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Digitizing Exam...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Select PDF File</span>
                  </>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
