// src/hooks/useFeatures.ts
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import type { AxiosResponse } from "axios";

interface FeaturesResponse {
    partnerships?: boolean;
}

export function useFeatures() {
    const [features, set] = useState<{ partnerships?: boolean }>({});
    useEffect(() => {
        axios.get("/features")
            .then((r: AxiosResponse<FeaturesResponse>) => set(r.data))
            .catch(() => set({}));
    }, []);
    return features;
}
