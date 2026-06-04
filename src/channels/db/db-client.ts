/**
 * DbClient (STUB)
 * ---------------
 * SQL (pg/mssql/oracledb) ve NoSQL (mongodb) doğrulama katmanı.
 * Cross-channel senaryoda API/UI değişikliğinin DB'ye yansımasını doğrular.
 * Faz 2'de implemente edilecek.
 */
export class DbClient {
  async querySql<T = unknown>(_sql: string, _params: unknown[] = []): Promise<T[]> {
    throw new Error('Not implemented: DbClient.querySql (Faz 2)');
  }
}
