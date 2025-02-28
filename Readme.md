# fastify-mikroORM

A Fastify plugin for integrating MikroORM.

This plugin provides a convenient way to integrate MikroORM into your Fastify applications. It allows you to register a MikroORM instance and access it throughout your application via the `fastify.orm` decorator.

## Features

*   Seamless integration of MikroORM with Fastify.
*   Supports single and namespaced MikroORM instances.
*   Automatically closes the MikroORM connection on server shutdown.
*   Allows using an existing MikroORM connection.

## Installation

```bash
npm i fastify-mikroorm
```

You'll also need to install a MikroORM driver (e.g., pg, mysql, sqlite).

```bash
npm install @mikro-orm/postgresql --save
```

## Usage

```ts
import Fastify from 'fastify';
import fastifyMikroOrm from 'fastify-mikroorm';
import { Options } from '@mikro-orm/core';
import { MariaDbDriver } from '@mikro-orm/mariadb';

const fastify = Fastify({ logger: true });

const mikroOrmOptions: Options<PostgreSqlDriver> = {
  dbName: 'your_db_name',
  driver: MariaDbDriver,
  user: 'your_user',
  password: 'your_password',
  port: 5432,
  host: 'localhost',
  entities: [], // Add your entities here
  debug: true,
  allowGlobalContext: true,
};

fastify.register(fastifyMikroOrm, mikroOrmOptions);

fastify.get('/test', async (request, reply) => {
    // Access the MikroORM entity manager
    const em = this.orm.em.fork(); // Use fork for request scope
    // Example: Fetch data from the database
    // const users = await em.find(User, {});
    reply.send({ message: 'MikroORM is working!' });
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
    fastify.log.error(err);
    process.exit(1);
    }
    fastify.log.info(`Server listening on ${address}`);
});
  
```

## Namespaced Usage

### You can register multiple MikroORM instances with different namespaces:

```ts
import Fastify from 'fastify';
import fastifyMikroOrm from 'fastify-mikroorm';
import { Options } from '@mikro-orm/core';
import { MariaDbDriver } from '@mikro-orm/mariadb';

const fastify = Fastify({ logger: true });

const mikroOrmOptions1: Options<PostgreSqlDriver> = {
  dbName: 'db1',
  user: 'user',
  password: 'password',
  port: 5432,
  host: 'localhost',
  entities: [],
  driver: MariaDbDriver,
  debug: true,
  allowGlobalContext: true,
  namespace: 'db1',
};

const mikroOrmOptions2: Options<PostgreSqlDriver> = {
  dbName: 'db2',
  user: 'user',
  password: 'password',
  port: 5432,
  host: 'localhost',
  driver: MariaDbDriver,
  entities: [],
  debug: true,
  allowGlobalContext: true,
  namespace: 'db2',
};

await fastify.register(fastifyMikroOrm, mikroOrmOptions1);
await fastify.register(fastifyMikroOrm, mikroOrmOptions2);

fastify.get('/test', async (request, reply) => {
    // Access the MikroORM entity manager for db1
    const em1 = fastify.orm.db1.em.fork();
    // Access the MikroORM entity manager for db2
    const em2 = fastify.orm.db2.em.fork();

    reply.send({ message: 'Multiple MikroORM instances are working!' });
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
    fastify.log.error(err);
    process.exit(1);
    }
    fastify.log.info(`Server listening on ${address}`);
});
```