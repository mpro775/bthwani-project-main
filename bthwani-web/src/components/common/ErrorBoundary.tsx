import  { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // اضبط حالة الخطأ مرة واحدة هنا فقط
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // سجّل أو أرسل للـ logging — بدون setState
    console.error("ErrorBoundary caught:", error, errorInfo);
    if (this.props.onError) this.props.onError(error, errorInfo);
  }

  // اختيارياً: زر لاستعادة الحالة بدون إعادة تحميل الصفحة
  private reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      // Fallback بسيط بدون MUI لتفادي أي تعارضات انتقال/ستايل
      return (
        <div style={{ padding: 16, direction: "rtl", textAlign: "center" }}>
          <h3 style={{ margin: 0, color: "#d32f2f" }}>حدث خطأ غير متوقع</h3>
          <p style={{ color: "#555" }}>
            {this.state.error?.message || "يرجى المحاولة مرة أخرى"}
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={this.reset} style={{ padding: "8px 12px" }}>
              متابعة
            </button>
            <button onClick={() => window.location.reload()} style={{ padding: "8px 12px" }}>
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
