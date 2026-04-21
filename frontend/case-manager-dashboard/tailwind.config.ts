import sharedConfig from "../shared-ui/tailwind.config";

export default {
  ...sharedConfig,
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../shared-ui/src/**/*.{ts,tsx}",
  ],
};
