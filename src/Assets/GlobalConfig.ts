import {Config} from "../Components/AppContext";
import {ApplicationSettings} from "./Common";

export let globalConfig: Config | null = null;
export let globalSettings: ApplicationSettings | null = null;

export type setGlobalConfigProps = {
    config?: Config
    settings?: ApplicationSettings
}

export const setGlobalConfig = (props: setGlobalConfigProps) => {
    globalConfig = props.config??globalConfig;
    globalSettings = props?.settings??globalSettings;
}

export const configUtils = {
    get isMockup(): boolean {
        return globalConfig?.mockup ?? false;
    },
    get grpoModificationSupervisor(): boolean {
        return globalSettings?.grpoModificationSupervisor??false;
    }
};

export const delay = (ms = 500): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
