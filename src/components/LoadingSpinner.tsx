const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <img
        src="/wire-logo-official.png"
        alt="Loading..."
        className="w-16 h-16 animate-pulse"
      />
      <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[shimmer-sweep_1s_ease-in-out_infinite]" style={{ width: '40%' }} />
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
