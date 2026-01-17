/**
 * ロガーユーティリティ
 * 開発環境でのみログを出力し、本番環境では出力しない
 */

/**
 * 開発環境かどうかを判定
 * __DEV__はReact Nativeのグローバル変数
 */
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

/**
 * ログレベル
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * ログ出力関数の型
 */
type LogFunction = (message: string, ...args: unknown[]) => void;

/**
 * ロガーインターフェース
 */
interface Logger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

/**
 * 開発環境用のログ出力
 */
const devLog = (level: LogLevel, message: string, ...args: unknown[]): void => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case 'debug':
      console.debug(prefix, message, ...args);
      break;
    case 'info':
      console.info(prefix, message, ...args);
      break;
    case 'warn':
      console.warn(prefix, message, ...args);
      break;
    case 'error':
      console.error(prefix, message, ...args);
      break;
  }
};

/**
 * 本番環境用のログ出力（何も出力しない）
 */
const prodLog = (_level: LogLevel, _message: string, ..._args: unknown[]): void => {
  // 本番環境ではログを出力しない
  // 将来的にはクラッシュレポートサービスに送信可能
};

/**
 * ロガー
 * 開発環境ではコンソールに出力、本番環境では何も出力しない
 */
export const logger: Logger = {
  debug: (message: string, ...args: unknown[]) =>
    isDev ? devLog('debug', message, ...args) : prodLog('debug', message, ...args),
  info: (message: string, ...args: unknown[]) =>
    isDev ? devLog('info', message, ...args) : prodLog('info', message, ...args),
  warn: (message: string, ...args: unknown[]) =>
    isDev ? devLog('warn', message, ...args) : prodLog('warn', message, ...args),
  error: (message: string, ...args: unknown[]) =>
    isDev ? devLog('error', message, ...args) : prodLog('error', message, ...args),
};

/**
 * ストレージ操作用のエラーハンドラー
 * @param operation 操作名
 * @param error エラーオブジェクト
 */
export const handleStorageError = (operation: string, error: unknown): void => {
  logger.error(`ストレージ操作エラー [${operation}]:`, error);
};

/**
 * Context操作用のエラーハンドラー
 * @param operation 操作名
 * @param error エラーオブジェクト
 */
export const handleContextError = (operation: string, error: unknown): void => {
  logger.error(`Context操作エラー [${operation}]:`, error);
};
