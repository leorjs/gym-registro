import { AlertTriangle } from "lucide-react";

export function FirebaseConfigAlert() {
  return (
    <div className="mb-5 rounded-lg border border-[#f1d5ab] bg-[#fff1dc] p-4 text-sm text-[#6d3b07]">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <div>
          <p className="font-black">Falta configurar Firebase</p>
          <p className="mt-1 leading-6">
            Copiá `.env.example` a `.env.local` y completá las variables `NEXT_PUBLIC_FIREBASE_*`.
          </p>
        </div>
      </div>
    </div>
  );
}
