import {Config} from "../Components/AppContext";

export let globalConfig: Config | null = null;

export const setGlobalConfig = (config: Config) => {
    globalConfig = config;
}