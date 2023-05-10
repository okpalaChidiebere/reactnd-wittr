import { openDB } from "idb";

export const MAX_MESSAGES = 30; //maximum number of posts we want to display on screen
const DATABASE_NAME = "wittr";
const DATABASE_VERSION = 2;
const TABLE_NAME = "wittrs";
const TABLE_INDEX_BY_DATE = "by-date";
const TABLE_INDEX_BY_DATE_SORT_FIELD = "time";

//uncomment for debugging in chrome only. we delete the db if everything get out of hand in dev lol
// indexedDB.deleteDatabase(DATABASE_NAME);

export const openDatabase = async () => {
  // If the browser doesn't support service worker,
  // we don't care about having a database
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  const db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(TABLE_NAME, {
        keyPath: "id",
      });
      store.createIndex(TABLE_INDEX_BY_DATE, TABLE_INDEX_BY_DATE_SORT_FIELD);
    },
  });

  return db;
};

export const getWittrs = async () => {
  const db = await openDatabase();
  if (!db) return [];
  const index = db
    .transaction(TABLE_NAME, "readonly")
    .objectStore(TABLE_NAME)
    .index(TABLE_INDEX_BY_DATE);
  const posts = await index.getAll();
  db.close();
  return posts.reverse();
};

export const bulkInsertWittrs = async (posts) => {
  const db = await openDatabase();

  if (!db) return;

  const tx = db.transaction(TABLE_NAME, "readwrite");
  const store = tx.objectStore(TABLE_NAME);
  posts.forEach((message) => {
    store.put(message);
  });

  // we get the by-date index because we want to remove the oldest posts
  let cursor = await store.index(TABLE_INDEX_BY_DATE).openCursor(null, "prev"); //null & prev will make the cursor go backwards through the index
  // starting with the newest post
  cursor = await cursor.advance(MAX_MESSAGES); // we don't care about the first 30 posts. They are advance ones to us. so we skip pass them
  // we delete the posts after 30
  while (cursor) {
    // console.log(cursor.key, cursor.value);
    await cursor.delete(); //delete the entry
    cursor = await cursor.continue(); // continue the cursor calling thesame cursor again to loop through the remaining entries
  }
  await tx.done;
  db.close();
};
