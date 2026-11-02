export type ScreenMetadataProps = {
  title: string;
  description?: string;
  publicPath?: string;
  dark: boolean;
};

// Native Head registers Handoff activities and requires an intentionally configured
// hosted origin. Screen metadata belongs to the web; keep native imports inert.
export function ScreenMetadata(_props: ScreenMetadataProps) {
  return null;
}
