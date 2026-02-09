/**
 * Constants for Repository Eligibility Scanner and Preview System
 */

export const RUNTIME_LIMITS = {
  MAX_REPO_SIZE_MB: 50, // 50MB limit for WebContainer
  MAX_FILE_COUNT: 1000,
  MAX_DEPENDENCY_COUNT: 50,
};

export const EXTERNAL_DB_PACKAGES = [
  'pg',
  'mysql',
  'mysql2',
  'mariadb',
  'mssql',
  'oracledb',
  'mongoose',
  'mongodb',
  'redis',
  'ioredis',
  'neo4j-driver',
  'cassandra-driver',
  'ali-oss',
  'aws-sdk',
  '@aws-sdk/client-s3',
  '@google-cloud/storage',
  'firebase',
  'firebase-admin',
  '@supabase/supabase-js', // Supabase is allowed via HTTP, but maybe not for local runtime if logic depends on it
];

// Databases that can run in-memory or are supported in WebContainer
export const ALLOWED_DB_PACKAGES = [
  '@prisma/client', // Prisma can use SQLite
  'better-sqlite3',
  'sqlite3',
  'sql.js',
  'lokijs',
  'lowdb',
  'pouchdb',
  'dexie',
  'rxdb',
];

export const BLOCKING_FILE_PATTERNS = {
  dockerCompose: ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'],
  kubernetes: [
    'k8s',
    'kubernetes',
    'deployment.yaml',
    'service.yaml',
    'ingress.yaml',
    'helm',
    'Chart.yaml',
  ],
};
