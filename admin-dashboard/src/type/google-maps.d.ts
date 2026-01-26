// (مرة واحدة – في ملف d.ts عندك مثلاً src/types/google-maps.d.ts)
declare namespace google.maps.places {
    interface AutocompletionRequest {
      /** Restrict predictions to bounds instead of biasing. */
      strictBounds?: boolean;
    }
  }
  