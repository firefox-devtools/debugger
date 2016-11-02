declare module "devtools-config" {
  declare module.exports: {
    isDevelopment: () => boolean;
    getValue: (key: string) => any;
    isEnabled: () => boolean;
    isTesting: () => boolean;
    isFirefoxPanel: () => boolean;
    isFirefox: () => boolean;
    setConfig: (value: Object) => void;
    getConfig: () => Object;
  }
}
