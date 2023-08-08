
// import * as Schema from "https://esm.sh/@effect/schema@0.33.0/Schema?bundle";
// import * as Evolu from "https://esm.sh/evolu@6.1.4?bundle";

import {Evolu, Schema} from "./dist/db.js"




const TodoId = Evolu.id("Todo");
// type TodoId = Schema.To<typeof TodoId>;

const TodoTable = Schema.struct({
    id: TodoId,
    title: Evolu.NonEmptyString1000,
    isCompleted: Evolu.SqliteBoolean,
});
// type TodoTable = Schema.To<typeof TodoTable>;

const Database = Schema.struct({
    todo: TodoTable,
});

const {
    useQuery,
    useMutation,
    useOwner,
    useOwnerActions,
    useEvoluError,
} = Evolu.create(Database);

// import { useSyncExternalStore } from 'https://esm.sh/react';

// export function useOnlineStatus() {
//   const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
//   return isOnline;
// }

// function getSnapshot() {
//   return navigator.onLine;
// }

// function getServerSnapshot() {
//   return true; // Always show "Online" for server-generated HTML
// }

// function subscribe(callback) {
//   // ...
// }

// useOnlineStatus()

// const { create, update } = useMutation();



// create("todo", { title, isCompleted: false });
// update("todo", { id, isCompleted: true });


// // import * as Schema from "@effect/schema/Schema";
// // import * as Evolu from "evolu";

// const x = Schema.parse(Evolu.String1000)(123);
// console.log(x)

export {}