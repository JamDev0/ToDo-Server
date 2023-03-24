import dotenv from "dotenv";

dotenv.config();

import { parse } from 'csv-parse';
import fs from 'fs';

fs.createReadStream(new URL("./input.csv", import.meta.url))
  .pipe(parse({
    columns: true
  }))
  .on('data', (row) => {
    fetch(`${process.env.PUBLIC_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify(row)
    })
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
});