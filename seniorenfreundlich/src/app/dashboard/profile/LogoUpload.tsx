"use client";

import Image from "next/image";

export default function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-700">Logo</p>
      <div className="mt-2 flex items-center gap-6">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Unternehmenslogo"
            width={80}
            height={80}
            style={{ width: "auto", height: "auto" }}
            className="rounded-md object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400">
            Kein Logo
          </div>
        )}
        <div className="flex flex-col gap-1">
          <input
            type="file"
            name="logo"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
          />
          <p className="text-xs text-zinc-500">JPEG, PNG, WebP oder SVG · max. 2 MB</p>
        </div>
      </div>
    </div>
  );
}
