// The subset of the Claude artifact runtime this app uses (db + user capabilities).
interface DbError { code: string; message: string }
interface DbDocSnap { id: string; exists: boolean; data(): Record<string, unknown> | undefined }
interface DbQuerySnap { docs: DbDocSnap[]; metadata: { fromCache: boolean; hasPendingWrites: boolean } }
interface DbDocRef { set(data: Record<string, unknown>): Promise<void>; delete(): Promise<void> }
interface DbCollection {
  doc(id: string): DbDocRef;
  onSnapshot(next: (s: DbQuerySnap) => void, error?: (e: DbError) => void): () => void;
}
interface ClaudeDb { collection(path: string): DbCollection }
interface ClaudeUser { id(): Promise<string | null> }
interface Window {
  claude?: { use(name: 'db'): Promise<ClaudeDb | null>; use(name: 'user'): Promise<ClaudeUser | null> };
}
