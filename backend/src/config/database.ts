import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

interface ConnectionStatus {
  isConnected: boolean;
  state: string;
  host?: string;
  name?: string;
}

const READY_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export class Database {
  private static instance: Database;
  private isConnecting = false;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private setupListeners(): void {
    mongoose.connection.on('connected', () => {
      logger.info(` MongoDB connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    // Graceful process termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public async connect(uri: string = env.MONGODB_URI): Promise<typeof mongoose | null> {
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB is already connected');
      return mongoose;
    }

    if (this.isConnecting) {
      logger.warn('MongoDB connection attempt already in progress');
      return null;
    }

    this.isConnecting = true;

    try {
      logger.info(`Connecting to MongoDB at ${uri.replace(/\/\/.*@/, '//<credentials>@')}...`);
      const conn = await mongoose.connect(uri, {
        dbName: env.MONGODB_DB_NAME,
        serverSelectionTimeoutMS: 5000,
        autoIndex: env.NODE_ENV !== 'production',
      });
      this.isConnecting = false;
      return conn;
    } catch (error) {
      this.isConnecting = false;
      logger.error('Failed to connect to MongoDB:', error);
      // We don't throw an unhandled crash here so server health endpoint can report status
      return null;
    }
  }

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully');
    }
  }

  public getStatus(): ConnectionStatus {
    const readyState = mongoose.connection.readyState;
    return {
      isConnected: readyState === 1,
      state: READY_STATES[readyState] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

export const db = Database.getInstance();
