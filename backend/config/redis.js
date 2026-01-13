import { createClient } from 'redis';

let redisClient = null;

export const initializeRedis = async () => {
  // Skip Redis if not configured
  if (!process.env.REDIS_HOST || process.env.REDIS_HOST === 'localhost') {
    console.log('⚠️  Redis not configured. Using memory store for rate limiting.');
    return;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379,
        connectTimeout: 5000,
        reconnectStrategy: false // Don't retry on failure
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message);
      redisClient = null; // Disable Redis on error
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('⚠️  Continuing without Redis. Rate limiting will use memory store.');
    redisClient = null;
  }
};

export const getRedisClient = () => redisClient;

export default redisClient;
