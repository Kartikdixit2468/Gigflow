import { createClient } from 'redis';

let redisClient = null;

export const initializeRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('⚠️  Continuing without Redis. Rate limiting will use memory store.');
  }
};

export const getRedisClient = () => redisClient;

export default redisClient;
