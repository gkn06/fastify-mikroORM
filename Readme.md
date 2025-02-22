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