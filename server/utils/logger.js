import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = logLevels[process.env.LOG_LEVEL?.toUpperCase()] ?? logLevels.INFO;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaString}\n`;
};

const writeToFile = (filename, message) => {
  if (process.env.NODE_ENV === 'production') {
    const filePath = path.join(logsDir, filename);
    fs.appendFileSync(filePath, message);
  }
};

export const logger = {
  error: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.ERROR) {
      const formattedMessage = formatMessage('ERROR', message, meta);
      console.error(formattedMessage.trim());
      writeToFile('error.log', formattedMessage);
    }
  },

  warn: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.WARN) {
      const formattedMessage = formatMessage('WARN', message, meta);
      console.warn(formattedMessage.trim());
      writeToFile('combined.log', formattedMessage);
    }
  },

  info: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.INFO) {
      const formattedMessage = formatMessage('INFO', message, meta);
      console.log(formattedMessage.trim());
      writeToFile('combined.log', formattedMessage);
    }
  },

  debug: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.DEBUG) {
      const formattedMessage = formatMessage('DEBUG', message, meta);
      console.log(formattedMessage.trim());
      writeToFile('debug.log', formattedMessage);
    }
  }
};

export default logger;