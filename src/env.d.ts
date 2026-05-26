/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GA_MEASUREMENT_ID: string;
  readonly GOOGLE_ADS_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
