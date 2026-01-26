import * as React from "react";

type Source = { uri?: string; html?: string };
type Props = {
  source: Source;
  style?: React.CSSProperties;
  allowsFullscreenVideo?: boolean;
  testID?: string;
};

export default function WebView({
  source,
  style,
  allowsFullscreenVideo,
  testID,
}: Props) {
  if (source?.html) {
    return (
      <div
        style={style}
        dangerouslySetInnerHTML={{ __html: source.html }}
        data-testid={testID || "webview-web-html"}
      />
    );
  }
  const src = source?.uri ?? "about:blank";
  return (
    <iframe
      src={src}
      style={{ border: 0, width: "100%", height: "100%", ...style }}
      allow={allowsFullscreenVideo ? "fullscreen" : undefined}
      data-testid={testID || "webview-web-iframe"}
    />
  );
}
