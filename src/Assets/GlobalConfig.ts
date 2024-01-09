import {Config} from "../Components/AppContext";

export let globalConfig: Config | null = null;

export const setGlobalConfig = (config: Config) => {
    globalConfig = config;
}

export const configUtils = {
    get isMockup(): boolean {
        return globalConfig?.mockup ?? false;
    }
};

export const delay = (ms = 500): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
