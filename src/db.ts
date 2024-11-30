import Dexie, { type EntityTable } from 'dexie';

interface Photo {
  id: number;
  name: string;
  data: Blob;
}

const db = new Dexie('Y2KPhotosDB') as Dexie & {
  albumn: EntityTable<
    Photo,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  albumn: '++id, name, data' // primary key "id" (for the runtime!)
});

export type { Photo };
export { db };