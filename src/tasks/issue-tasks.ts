import type { Issue, IssuePort } from '../core/ports/issue-port';
import type { TypedStore } from '../support/store';
import type { CleanupRegistry } from '../support/cleanup-registry';
import { Keys } from '../support/store-keys';
import { newIssueInput, type IssueInput } from '../factories/issue-factory';

/**
 * Issue task'ları (ADR-0001) — kompoze edilebilir iş görevleri.
 * Task = SAF fonksiyon, AÇIK bağımlılıklar (gizli state/god-object yok). Somut adapter'a
 * değil PORT'a bağlanır → tool-bağımsız, birim-test edilebilir. Chaining bunlarla kurulur.
 */
export interface IssueTaskDeps {
  issuePort: IssuePort;
  store: TypedStore;
  cleanup: CleanupRegistry;
}

/**
 * Issue üretir ve "üretim disiplinini" tek çağrıda uygular:
 *  1) port ile yarat, 2) cleanup'ı ÜRETİMLE AYNI yerde kaydet,
 *  3) store koleksiyonuna biriktir. Üretilen entity döner (parent→child zincirinde kullanılır).
 */
export async function createIssue(
  deps: IssueTaskDeps,
  input: IssueInput = newIssueInput(),
): Promise<Issue> {
  const issue = await deps.issuePort.create(input.summary);
  deps.cleanup.register(() => deps.issuePort.delete(issue.id));
  deps.store.push(Keys.CREATED_ISSUES, issue);
  return issue;
}
