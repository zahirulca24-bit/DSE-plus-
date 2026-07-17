import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-bg-dark font-sans py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-text-primary tracking-widest font-semibold">
            DSE PULSE TERMINAL
          </span>
          <span className="text-[10px] font-mono text-text-muted mt-1 uppercase">
            Initializing Core Modules...
          </span>
        </div>
      </div>
    </div>
  );
}
