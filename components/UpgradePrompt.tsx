'use client';

interface UpgradePromptProps {
  onUpgrade: () => void;
  loading: boolean;
}

export default function UpgradePrompt({ onUpgrade, loading }: UpgradePromptProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            🚀 Upgrade to Pro Plan
          </h3>
          <p className="text-indigo-100">
            You've reached the free plan limit of 3 notes. Upgrade to Pro for unlimited notes!
          </p>
        </div>
        <button
          onClick={onUpgrade}
          disabled={loading}
          className="bg-white text-indigo-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Upgrading...' : 'Upgrade Now'}
        </button>
      </div>
    </div>
  );
}
