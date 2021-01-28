# MICA - Illness Data Collection Application

This project use
- Angular 7
- Redux
- Sass
- NgRx

## Project reqirements

- Node 8+
- Angular CLI 7

## Folders

```
/src
    /app            - angular components, modules and services
    /assets         - images and svg Shapes for body selector
    /environments
    /test           - mocked data and stubs
    /types
/versioning         - seting app version
```

## Scripts 

**Run**
- `ng serve` - Run a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

**Test. Code coverage is currently 100%**
- `npm run test:watch` - Run tests and generate a code coverage report. The latter can be accessed by opening *coverage/index.html* with a browser. The test will automatically reload if you change any of the source files
- `npm run test:ubuntu` - Using in CI pipeline.

**Build**
- `npm run build:local` will compile app in production environment with AOT.
- `npm run build` Using in CI pipeline.
- `npm run build:pilot` Using in CI pipeline.

## Flow
- We start working with a `develop` branch. We branch from it and create a new branch 
- The branch name should look like `MICA-1825-Ticket-title-from-Jira`
- When we create MR, we copy the ticket number and the heading from Jira to the MR title
- Set the checkbox *Delete source branch when merge request is accepted.*

**!!Before creating MR. It is strongly recommended to run tests and builds and make sure that the code coverage is 100%.**
```
npm run test:ubuntu
npm run build:local
```
21/02/2019



# Old Readme

# Advi

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.22-1.

## External Dependencies

- **NO** jQuery to follow best angular 2 practices
- Bootstrap 4 alpha.5 with flexbox enabled. No JS files added. See `src/styles/bootstrap/bootsrap.scss` for more details on which modules are used.

## Data

There is a `json` file with a small dummy data set with illnesses names, descriptions and approval dates. Use scripts below to run it.

## Scripts

- `npm run data-server`: will start the data server locally with dummy data. By default, data will be available at REST end point `illness`. Default port is 3000.
- `npm run start:dev`: will start the data server on port 3000 and run `ng serve` (app available on port 4200).
- `npm start`: will start the data server on port 3000 and the Node/Express server on port 4000.
- `npm run build`: will compile app in production environment without AOT. There is a [bug](https://github.com/angular/angular-cli/issues/2673) in angular-cli which doesn't assign environment using AOT 

## tests

Coverage is currently 100%

Run `ng test --code-coverage` to run tests and generate a code coverage report. The latter can be accessed by opening `coverage/index.html` with a browser 

## ANGULAR-CLI NOTES

This project uses angular-cli default configuration except for the following:

- Karma uses mocha reporter
- Tslint rules changes:
  - Codelyzer rule for `component-selector` disabled to be able to have selector names as per the specs.
  - Double quotes

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Github Pages

Run `ng github-pages:deploy` to deploy to Github Pages.

## Further help

To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
