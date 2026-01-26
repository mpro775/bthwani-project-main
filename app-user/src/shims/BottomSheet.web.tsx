import * as React from 'react';

type Props = React.PropsWithChildren<{
  index?: number;                 // -1 مغلق، >=0 مفتوح
  snapPoints?: Array<string|number>;
  enablePanDownToClose?: boolean;
  onChange?: (idx:number)=>void;
  style?: React.CSSProperties;
  testID?: string;
}>;

export default function BottomSheet({ index = -1, children, style, testID }: Props) {
  if (index < 0) return null;
  return (
    <div
      data-testid={testID || 'bottomsheet-web'}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: '72vh',
        background: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        boxShadow: '0 -8px 28px rgba(0,0,0,0.14)',
        overflowY: 'auto',
        padding: 16,
        zIndex: 50,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
