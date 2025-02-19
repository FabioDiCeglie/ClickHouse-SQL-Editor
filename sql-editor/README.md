## Setup

- Requires docker and docker compose
- Requires Node 20+
- Requires TypeScript

`docker compose up -d`
`npm i`

## Start the application

`npm run start`

## Run the tests

`npm run test:watch`

## Use the requests.http to see how you can use the api

### Work assignment

Time: ~3 hours

Given the current project, let's create a mini sql query editor in TypeScript and React. When opening the `/` the React application
should render and display a sql editor where we can write our queries. For inspiration, you can sign up for a free trial in ClickHouse Cloud
and experiment with the fully-featured SQL Console.

Implement the following features

- Run a query and display the query results in the UI
- Support sql script running and display results

Bonus:

- Insert data from a file

Note:

We encourage you to make this your own, implementing features your feel appropriate, and introducing 3rd party dependencies that you want. We have our [UI component library](https://click-ui.vercel.app) if you want some help with the components design that can give you some leverage and accelerate speed of development, but you are free to use whatever you would prefer.
