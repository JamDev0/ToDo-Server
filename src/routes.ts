import { formatISO } from 'date-fns';
import { randomUUID } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";
import { Task } from "./entities";
import { Req } from "./server";
import { DatabaseInitializer } from "./services/databaseInitializer";
import { pathBuilder } from "./utils/pathBuilder";
import { sort } from "./utils/sort";

interface Route {
  path: RegExp;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  handler: (req: Req, res: ServerResponse<IncomingMessage>) => ServerResponse<IncomingMessage>
} 

const tasksSearchParams = ["title", "description", "order", "sort_by"] as const;

const database = new DatabaseInitializer();

export const routes: Route[] = [
  {
    path: pathBuilder("/tasks"),
    method: "GET",
    handler: (req, res) => {
      const { headers: { host }, url: route } = req;
          
      const url = new URL(`http://${host}${route}`); 

      const searchParams = Object.fromEntries(url.searchParams) as unknown as {[key in typeof tasksSearchParams[number]] : string};

      const searchParamsKeys = Array.from(url.searchParams.keys()) as unknown as typeof tasksSearchParams;

      const tasks = database.select("tasks");

      if(url.searchParams) {
        const isThereAInvalidSearchParam = !searchParamsKeys.reduce((acc, key) => {
          if(!tasksSearchParams.find(musicSearchParm => musicSearchParm === key)) {
            return false;
          }

          return (acc && true);
        }, true)

        if(isThereAInvalidSearchParam) {
          return res.writeHead(400, "Invalid search parameter").end();
        }

        const filteredTasks = tasks.filter(task => {
          return searchParamsKeys.reduce((acc, key) => {
            if(key !== "sort_by" && key !== "order") {
              return (acc && ( task[key].includes(searchParams[key]) ));
            }

            return true && acc
          }, true);
        });

        const { sort_by, order } = searchParams;

        if(sort_by) {
          const sortedTasks = sort(filteredTasks, sort_by, order as "DESC" | "ASC");

          return res.writeHead(200).end(JSON.stringify(sortedTasks));
        }

        return res.writeHead(200).end(JSON.stringify(filteredTasks));
      }

      return res.writeHead(200).end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: pathBuilder("/tasks"),
    handler: (req, res) => {
      if(!req.body.title && !req.body.description) {
        return res.writeHead(400, "Body is missing property").end();
      }

      const newDate = formatISO(new Date());

      const task = {
        title: req.body.title,
        description: req.body.description,
        created_at: newDate,
        completed_at: null,
        updated_at: newDate,
        id: randomUUID(),
      } as Task

      database.insert("tasks", task);

      return res.writeHead(200).end();
    }
  },
  {
    path: pathBuilder("/tasks/:id"),
    method: "PUT",
    handler: (req, res) => {
      const tasks = database.select("tasks");

      const taskId = req.parms.id;

      const taskExists = !!tasks.find(task => task.id === taskId);

      if(!taskExists) {
        return res.writeHead(404, `Task with id: ${taskId} dosen't exists`).end();
      }

      const reqBody = req.body;

      const invalidBodyProperty = !Object.keys(req.body).reduce((acc, key) => (key === "title" || key === "description") && acc, true);

      if(invalidBodyProperty) {
        return res.writeHead(400, "Body has a invalid property").end();
      }

      const bodyIsMissingProperty = !("title" in reqBody || "description" in reqBody);

      if(bodyIsMissingProperty) {
        return res.writeHead(400, "Body is missing a property").end();
      }

      database.update<Task>("tasks", taskId, { ...reqBody, updated_at: formatISO(new Date())});

      return res.writeHead(200).end();
    }
  },
  {
    path: pathBuilder("/tasks/:id"),
    method: "DELETE",
    handler: (req, res) => {
      const tasks = database.select("tasks");
      
      const taskId = req.parms.id;

      const taskExists = !!tasks.find(task => task.id === taskId);

      if(!taskExists) {
        return res.writeHead(404, `Task with id: ${taskId} dosen't exists`).end();
      }

      database.delete("tasks", taskId);

      return res.writeHead(200).end();
    }
  },
  {
    path: pathBuilder("/tasks/:id/checked"),
    method: "PATCH",
    handler: (req, res) => {
      const tasks = database.select("tasks");
      
      const taskId = req.parms.id;

      const task = tasks.find(task => task.id === taskId);

      const taskExists = !!task;

      if(!taskExists) {
        return res.writeHead(404, `Task with id: ${taskId} dosen't exists`).end();
      }

      database.update<Task>("tasks", req.parms.id, { completed_at: task.completed_at ? null : formatISO(new Date()) });

      return res.writeHead(200).end();
    }
  }
]


