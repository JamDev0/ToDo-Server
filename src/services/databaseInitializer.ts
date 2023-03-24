import fs from "node:fs/promises";
import { Task } from "../entities";

const dbPath = new URL("../db.json", import.meta.url);

interface DatabaseSchema {
  tasks: Task[];
}

export class DatabaseInitializer {
  #database: DatabaseSchema = {} as DatabaseSchema;

  constructor() {
    fs.readFile(dbPath, { encoding: "utf-8" })
    .then(data => {
      this.#database = JSON.parse(data);
    })
    .catch(() => {
      this.#persists();
    })
  }

  #persists() {
    fs.writeFile(dbPath, JSON.stringify(this.#database));
  }

  insert(table: keyof DatabaseSchema, data: Task) {
    if(this.#database[table]) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persists();
  }

  select(table: keyof DatabaseSchema) {
    const data = this.#database[table] ?? [];
    
    return data;
  }

  delete(table: keyof DatabaseSchema, id: string) {
    this.#database[table] = this.#database[table].filter(entry => entry.id !== id);

    this.#persists();
  }

  update<T>(table: keyof DatabaseSchema, entryId: string, object: Partial<T>) {
    this.#database[table] = this.#database[table].map(entry => {
      if(entry.id === entryId) {
        return {
          ...entry,
          ...object,
        }
      }

      return entry;
    });
  }
}

