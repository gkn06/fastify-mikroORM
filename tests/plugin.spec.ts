import Fastify, { FastifyInstance } from 'fastify';
import { MikroORM, Options } from '@mikro-orm/core';
import { MariaDbDriver } from '@mikro-orm/mariadb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import mikroOrmConnector, { PluginMikroORM } from '../src/plugin';

const testOptions: Options<MariaDbDriver> = {
    host: '127.0.0.1',
    port: 3307,
    dbName: 'test_db',
    driver: MariaDbDriver,
    user: 'root',
    password: 'root',
    entities: [],
    discovery: { warnWhenNoEntities: false },
    debug: false,
    allowGlobalContext: true,
}

describe('fastify-mikroORM', () => {
  let fastify: FastifyInstance;

  beforeEach(async () => {
    fastify = Fastify();
  });

  afterEach(async () => {
    await fastify.close();
  });

  it('should register MikroORM without namespace', async () => {
    await fastify.register(mikroOrmConnector, testOptions);

    expect(fastify.orm).toBeInstanceOf(MikroORM);
  });

  it('should register MikroORM with namespace', async () => {
    await fastify.register(mikroOrmConnector, {
      ...testOptions,
      namespace: 'test',
    });

    expect(fastify.orm.test).toBeInstanceOf(MikroORM);
  });

  it('should throw an error if MikroORM is already registered', async () => {
    await fastify.register(mikroOrmConnector, testOptions);

    await expect(fastify.register(mikroOrmConnector, testOptions)).rejects.toThrow(
      'MikroORM is already registered',
    );
  });

  it('should throw an error if namespace is already used', async () => {
    await fastify.register(mikroOrmConnector, {
      ...testOptions,
      namespace: 'test',
    });

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
      ...testOptions,
      connection: ormMock,
    });

    expect(fastify.orm).toBe(ormMock);
  });

  it('should use existing connection with namespace', async () => {
    const ormMock = {
        close: vi.fn(),
    } as unknown as MikroORM;
    await fastify.register(mikroOrmConnector, {
      ...testOptions,
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
});
