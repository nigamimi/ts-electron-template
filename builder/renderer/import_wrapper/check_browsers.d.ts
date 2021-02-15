declare function checkBrowsers(
    dir: string,
    isInteractive: boolean,
    retry?: boolean
): Promise<string[]>;

interface DefaultBrowsers {
    production: [">0.2%", "not dead", "not op_mini all"];
    development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"];
}
declare const defaultBrowsers: DefaultBrowsers;

export { checkBrowsers, defaultBrowsers };
