const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-end gap-3">
        <img
          src="/wire-logo-official.png"
          alt="Loading..."
          className="w-16 h-16 animate-pulse"
        />
        <img
          src="/images/mascot-seal.png"
          alt="Seal mascot"
          className="w-14 h-14 animate-mascot-bounce"
        />
      </div>
      <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[shimmer-sweep_1s_ease-in-out_infinite]" style={{ width: '40%' }} />
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
