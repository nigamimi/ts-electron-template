import type { apiKeyName, methods } from "../../electron_main/src/preload";

declare global {
    interface Window {
        [apiKeyName]: typeof methods;
    }
}
