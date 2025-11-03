import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Universidad San Andrés De Guanajuato",
  version: packageJson.version,
  copyright: `© ${currentYear}, Universidad San Andrés De Guanajuato.`,
  meta: {
    title: "Universidad San Andrés De Guanajuato - Modern Next.js Dashboard Starter Template",
    description:
      "Universidad San Andrés De Guanajuato",
  },
};
