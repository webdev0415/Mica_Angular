// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  pilot: false,
  SENTRY_KEY: 'https://19de7d12d2aa4da1bb3778a82489d703@sentry.io/2472883',
  serviceUrls: {
    host: 'https://devservices.advinow.net',
    utility: 'https://utilities-staging.advinow.net'
  },
  appTitle: 'MICA | Development'
};
