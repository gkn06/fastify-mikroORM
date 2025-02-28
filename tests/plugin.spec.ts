import Fastify, { type FastifyInstance } from 'fastify';
import { MikroORM, type Options } from '@mikro-orm/core';
import { MariaDbDriver } from '@mikro-orm/mariadb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import mikroOrmConnector from '../src/plugin';

const testOptions: Options<MariaDbDriver> = {
    host: '127.0.0.1',
    port: 3307,
    dbName: 'test_db',
    driver: MariaDbDriver,
    user: 'root',
    password: 'root',
    discovery: { warnWhenNoEntities: false }
}

describe('fastify-mikroORM', () => {
  let fastify: FastifyInstance;
  let orm: MikroORM | null;

  beforeEach(async () => {
    fastify = Fastify();
    orm = null;
  });

  it('should register MikroORM without namespace', async () => {
    await fastify.register(mikroOrmConnector, testOptions);
    orm = fastify.orm;

    expect(fastify.orm).toBeInstanceOf(MikroORM);
  });

  it('should register MikroORM with namespace', async () => {
    await fastify.register(mikroOrmConnector, {
      ...testOptions,
      namespace: 'test',
    });
    orm = fastify.orm.test;

    expect(fastify.orm.test).toBeInstanceOf(MikroORM);
    await dropSchema(fastify.orm.test);
  });

  it('should throw an error if MikroORM is already registered', async () => {
    await fastify.register(mikroOrmConnector, testOptions);
    orm = fastify.orm;

    await expect(fastify.register(mikroOrmConnector, testOptions)).rejects.toThrow(
      'MikroORM is already registered',
    );
  });

  it('should throw an error if namespace is already used', async () => {
    await fastify.register(mikroOrmConnector, {
      ...testOptions,
      namespace: 'test',
    });
    orm = fastify.orm.test;

    await expect(
      fastify.register(mikroOrmConnector, {
        ...testOptions,
        namespace: 'test',
      }),
    ).rejects.toThrow('MikroORM namespace already used: test');
  });

  it('should close the connection on server close without namespace', async () => {
    const ormMock = {
        close: vi.fn(),
    } as unknown as MikroORM;

    fastify.register(mikroOrmConnector, {
      ...testOptions,
      connection: ormMock,
    });

    await fastify.ready();
    await fastify.close();

    expect(ormMock.close).toHaveBeenCalled();
  });

  it('should close the connection on server close with namespace', async () => {
    fastify = require('fastify')();
    const ormMock = {
        close: vi.fn(),
    } as unknown as MikroORM;
    fastify.register(mikroOrmConnector, {
      ...testOptions,
      namespace: 'test',
      connection: ormMock,
    });

    await fastify.ready();
    await fastify.close();

    expect(ormMock.close).toHaveBeenCalled();
  });

  it('should use existing connection', async () => {
    const ormMock = {
        close: vi.fn(),
    } as unknown as MikroORM;

    await fastify.register(mikroOrmConnector, {
      connection: ormMock,
    });

    expect(fastify.orm).toBe(ormMock);
  });

  it('should use existing connection with namespace', async () => {
    const ormMock = {
        close: vi.fn(),
    } as unknown as MikroORM;
    await fastify.register(mikroOrmConnector, {
      namespace: 'test',
      connection: ormMock,
    });

    expect(fastify.orm.test).toBe(ormMock);
  });

  it('should log info message on close without namespace', async () => {
    const logMock = { info: vi.fn() };
    fastify.log = logMock as any;

    await fastify.register(mikroOrmConnector, testOptions);
    await fastify.ready();
    await fastify.close();

    expect(logMock.info).toHaveBeenCalledWith('MikroORM connection closed');
  });

  it('should log info message on close with namespace', async () => {
    const logMock = { info: vi.fn() };
    fastify.log = logMock as any;

    await fastify.register(mikroOrmConnector, {
      ...testOptions,
      namespace: 'test',
    });
    await fastify.ready();
    await fastify.close();

    expect(logMock.info).toHaveBeenCalledWith(
      'MikroORM connection test closed',
    );
  });

  afterEach(async () => {
    if (orm) {
      await dropSchema(orm);
    }
    await fastify.close();
  });
});

async function dropSchema(orm: MikroORM) {
  try {
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema({dropDb: true});
    console.log('Schema dropped successfully.');
  } catch (error) {
    console.error('Error dropping schema:', error);
  }
}