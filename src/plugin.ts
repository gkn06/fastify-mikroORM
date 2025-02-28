import { MikroORM, type Options } from '@mikro-orm/core';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export type NameSpacedMikroORM = {
  [namespace: string]: MikroORM;
};

export type PluginMikroORM = MikroORM & NameSpacedMikroORM;

declare module 'fastify' {
  export interface FastifyInstance {
    orm: PluginMikroORM;
  }
}

type DatabaseConfigOptions = {
  connection?: MikroORM;
  namespace?: string;
} & Partial<Options>;

const mikroOrmConnector: FastifyPluginAsync<DatabaseConfigOptions> = async (
  fastify,
  options,
) => {
  const { namespace, connection, ...config } = options;

  let orm: MikroORM;
  if (connection) {
    orm = connection;
  } else {
    orm = await MikroORM.init(config as Options);
  }

  if (namespace) {
    if (!fastify.hasDecorator('orm')) {
      fastify.decorate('orm', Object.create(null));
    }

    if (fastify.orm[namespace]) {
      throw new Error(`MikroORM namespace already used: ${namespace}`);
    }

    fastify.orm[namespace] = orm;

    fastify.addHook('onClose', async (instance) => {
      await instance.orm[namespace].close();
      instance.log.info(`MikroORM connection ${namespace} closed`);
    });
  } else {
    if (fastify.hasDecorator('orm')) {
      throw new Error('MikroORM is already registered');
    }

    fastify.decorate('orm', orm as PluginMikroORM);

    fastify.addHook('onClose', async (instance) => {
      await instance.orm.close();
      fastify.log.info('MikroORM connection closed');
    });
  }
};

export default fp(mikroOrmConnector, {
	fastify: '5.x',
	name: 'fastify-mikroORM',
});
