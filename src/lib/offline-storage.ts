import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FieldDB extends DBSchema {
    submissions: {
        key: string;
        value: {
            id: string;
            formId: string;
            data: any;
            location?: any;
            timestamp: number;
            synced: boolean;
        };
        indexes: { 'by-form': string; 'by-sync': number };
    };
}

let dbPromise: Promise<IDBPDatabase<FieldDB>>;

if (typeof window !== 'undefined') {
    dbPromise = openDB<FieldDB>('blesh-field-ops', 1, {
        upgrade(db) {
            const store = db.createObjectStore('submissions', {
                keyPath: 'id',
            });
            store.createIndex('by-form', 'formId');
            store.createIndex('by-sync', 'synced');
        },
    });
}

export const saveOfflineSubmission = async (formId: string, data: any, location?: any) => {
    const db = await dbPromise;
    const id = Math.random().toString(36).substr(2, 9);
    await db.put('submissions', {
        id,
        formId,
        data,
        location,
        timestamp: Date.now(),
        synced: false,
    });
    return id;
};

export const getUnsyncedSubmissions = async () => {
    const db = await dbPromise;
    return db.getAllFromIndex('submissions', 'by-sync', 0);
};

export const markAsSynced = async (id: string) => {
    const db = await dbPromise;
    const sub = await db.get('submissions', id);
    if (sub) {
        sub.synced = true;
        await db.put('submissions', sub);
    }
};
