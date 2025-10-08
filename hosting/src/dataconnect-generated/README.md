# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPOVs*](#listpovs)
  - [*ListUsers*](#listusers)
  - [*ListUserPOVs*](#listuserpovs)
  - [*GetPOVById*](#getpovbyid)
  - [*SearchPOVs*](#searchpovs)
- [**Mutations**](#mutations)
  - [*CreatePOV*](#createpov)
  - [*UpsertUser*](#upsertuser)
  - [*AddComment*](#addcomment)
  - [*DeleteComment*](#deletecomment)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPOVs
You can execute the `ListPOVs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPoVs(): QueryPromise<ListPoVsData, undefined>;

interface ListPoVsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPoVsData, undefined>;
}
export const listPoVsRef: ListPoVsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPoVs(dc: DataConnect): QueryPromise<ListPoVsData, undefined>;

interface ListPoVsRef {
  ...
  (dc: DataConnect): QueryRef<ListPoVsData, undefined>;
}
export const listPoVsRef: ListPoVsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPoVsRef:
```typescript
const name = listPoVsRef.operationName;
console.log(name);
```

### Variables
The `ListPOVs` query has no variables.
### Return Type
Recall that executing the `ListPOVs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPoVsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPoVsData {
  povs: ({
    id: UUIDString;
    name: string;
    customer: string;
    industry?: string | null;
    status: string;
  } & Pov_Key)[];
}
```
### Using `ListPOVs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPoVs } from '@dataconnect/generated';


// Call the `listPoVs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPoVs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPoVs(dataConnect);

console.log(data.povs);

// Or, you can use the `Promise` API.
listPoVs().then((response) => {
  const data = response.data;
  console.log(data.povs);
});
```

### Using `ListPOVs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPoVsRef } from '@dataconnect/generated';


// Call the `listPoVsRef()` function to get a reference to the query.
const ref = listPoVsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPoVsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.povs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.povs);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    id: string;
    email: string;
    displayName?: string | null;
  } & User_Key)[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListUserPOVs
You can execute the `ListUserPOVs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUserPoVs(): QueryPromise<ListUserPoVsData, undefined>;

interface ListUserPoVsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserPoVsData, undefined>;
}
export const listUserPoVsRef: ListUserPoVsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUserPoVs(dc: DataConnect): QueryPromise<ListUserPoVsData, undefined>;

interface ListUserPoVsRef {
  ...
  (dc: DataConnect): QueryRef<ListUserPoVsData, undefined>;
}
export const listUserPoVsRef: ListUserPoVsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUserPoVsRef:
```typescript
const name = listUserPoVsRef.operationName;
console.log(name);
```

### Variables
The `ListUserPOVs` query has no variables.
### Return Type
Recall that executing the `ListUserPOVs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUserPoVsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUserPoVsData {
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    createdPOVs: ({
      id: UUIDString;
      name: string;
      customer: string;
      status: string;
      priority?: string | null;
      startDate?: DateString | null;
      endDate?: DateString | null;
    } & Pov_Key)[];
  } & User_Key;
}
```
### Using `ListUserPOVs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUserPoVs } from '@dataconnect/generated';


// Call the `listUserPoVs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUserPoVs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUserPoVs(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
listUserPoVs().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `ListUserPOVs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUserPoVsRef } from '@dataconnect/generated';


// Call the `listUserPoVsRef()` function to get a reference to the query.
const ref = listUserPoVsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUserPoVsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetPOVById
You can execute the `GetPOVById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPovById(vars: GetPovByIdVariables): QueryPromise<GetPovByIdData, GetPovByIdVariables>;

interface GetPovByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPovByIdVariables): QueryRef<GetPovByIdData, GetPovByIdVariables>;
}
export const getPovByIdRef: GetPovByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPovById(dc: DataConnect, vars: GetPovByIdVariables): QueryPromise<GetPovByIdData, GetPovByIdVariables>;

interface GetPovByIdRef {
  ...
  (dc: DataConnect, vars: GetPovByIdVariables): QueryRef<GetPovByIdData, GetPovByIdVariables>;
}
export const getPovByIdRef: GetPovByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPovByIdRef:
```typescript
const name = getPovByIdRef.operationName;
console.log(name);
```

### Variables
The `GetPOVById` query requires an argument of type `GetPovByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPovByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetPOVById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPovByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPovByIdData {
  pov?: {
    id: UUIDString;
    name: string;
    customer: string;
    industry?: string | null;
    useCase: string;
    status: string;
    priority?: string | null;
    startDate?: DateString | null;
    endDate?: DateString | null;
    estimatedTimeline?: string | null;
    budget?: string | null;
    createdBy: {
      id: string;
      email: string;
      displayName?: string | null;
    } & User_Key;
      assignedTo?: {
        id: string;
        email: string;
        displayName?: string | null;
      } & User_Key;
        createdAt: DateString;
        updatedAt: DateString;
        tags?: string | null;
        notes?: string | null;
  } & Pov_Key;
}
```
### Using `GetPOVById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPovById, GetPovByIdVariables } from '@dataconnect/generated';

// The `GetPOVById` query requires an argument of type `GetPovByIdVariables`:
const getPovByIdVars: GetPovByIdVariables = {
  id: ..., 
};

// Call the `getPovById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPovById(getPovByIdVars);
// Variables can be defined inline as well.
const { data } = await getPovById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPovById(dataConnect, getPovByIdVars);

console.log(data.pov);

// Or, you can use the `Promise` API.
getPovById(getPovByIdVars).then((response) => {
  const data = response.data;
  console.log(data.pov);
});
```

### Using `GetPOVById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPovByIdRef, GetPovByIdVariables } from '@dataconnect/generated';

// The `GetPOVById` query requires an argument of type `GetPovByIdVariables`:
const getPovByIdVars: GetPovByIdVariables = {
  id: ..., 
};

// Call the `getPovByIdRef()` function to get a reference to the query.
const ref = getPovByIdRef(getPovByIdVars);
// Variables can be defined inline as well.
const ref = getPovByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPovByIdRef(dataConnect, getPovByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.pov);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.pov);
});
```

## SearchPOVs
You can execute the `SearchPOVs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
searchPoVs(vars?: SearchPoVsVariables): QueryPromise<SearchPoVsData, SearchPoVsVariables>;

interface SearchPoVsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchPoVsVariables): QueryRef<SearchPoVsData, SearchPoVsVariables>;
}
export const searchPoVsRef: SearchPoVsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchPoVs(dc: DataConnect, vars?: SearchPoVsVariables): QueryPromise<SearchPoVsData, SearchPoVsVariables>;

interface SearchPoVsRef {
  ...
  (dc: DataConnect, vars?: SearchPoVsVariables): QueryRef<SearchPoVsData, SearchPoVsVariables>;
}
export const searchPoVsRef: SearchPoVsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchPoVsRef:
```typescript
const name = searchPoVsRef.operationName;
console.log(name);
```

### Variables
The `SearchPOVs` query has an optional argument of type `SearchPoVsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchPoVsVariables {
  nameInput?: string | null;
  customer?: string | null;
}
```
### Return Type
Recall that executing the `SearchPOVs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchPoVsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SearchPoVsData {
  povs: ({
    id: UUIDString;
    name: string;
    customer: string;
    status: string;
    priority?: string | null;
  } & Pov_Key)[];
}
```
### Using `SearchPOVs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchPoVs, SearchPoVsVariables } from '@dataconnect/generated';

// The `SearchPOVs` query has an optional argument of type `SearchPoVsVariables`:
const searchPoVsVars: SearchPoVsVariables = {
  nameInput: ..., // optional
  customer: ..., // optional
};

// Call the `searchPoVs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchPoVs(searchPoVsVars);
// Variables can be defined inline as well.
const { data } = await searchPoVs({ nameInput: ..., customer: ..., });
// Since all variables are optional for this query, you can omit the `SearchPoVsVariables` argument.
const { data } = await searchPoVs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchPoVs(dataConnect, searchPoVsVars);

console.log(data.povs);

// Or, you can use the `Promise` API.
searchPoVs(searchPoVsVars).then((response) => {
  const data = response.data;
  console.log(data.povs);
});
```

### Using `SearchPOVs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchPoVsRef, SearchPoVsVariables } from '@dataconnect/generated';

// The `SearchPOVs` query has an optional argument of type `SearchPoVsVariables`:
const searchPoVsVars: SearchPoVsVariables = {
  nameInput: ..., // optional
  customer: ..., // optional
};

// Call the `searchPoVsRef()` function to get a reference to the query.
const ref = searchPoVsRef(searchPoVsVars);
// Variables can be defined inline as well.
const ref = searchPoVsRef({ nameInput: ..., customer: ..., });
// Since all variables are optional for this query, you can omit the `SearchPoVsVariables` argument.
const ref = searchPoVsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchPoVsRef(dataConnect, searchPoVsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.povs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.povs);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreatePOV
You can execute the `CreatePOV` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPov(vars: CreatePovVariables): MutationPromise<CreatePovData, CreatePovVariables>;

interface CreatePovRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePovVariables): MutationRef<CreatePovData, CreatePovVariables>;
}
export const createPovRef: CreatePovRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPov(dc: DataConnect, vars: CreatePovVariables): MutationPromise<CreatePovData, CreatePovVariables>;

interface CreatePovRef {
  ...
  (dc: DataConnect, vars: CreatePovVariables): MutationRef<CreatePovData, CreatePovVariables>;
}
export const createPovRef: CreatePovRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPovRef:
```typescript
const name = createPovRef.operationName;
console.log(name);
```

### Variables
The `CreatePOV` mutation requires an argument of type `CreatePovVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePovVariables {
  name: string;
  customer: string;
  useCase: string;
}
```
### Return Type
Recall that executing the `CreatePOV` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePovData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePovData {
  pov_insert: Pov_Key;
}
```
### Using `CreatePOV`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPov, CreatePovVariables } from '@dataconnect/generated';

// The `CreatePOV` mutation requires an argument of type `CreatePovVariables`:
const createPovVars: CreatePovVariables = {
  name: ..., 
  customer: ..., 
  useCase: ..., 
};

// Call the `createPov()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPov(createPovVars);
// Variables can be defined inline as well.
const { data } = await createPov({ name: ..., customer: ..., useCase: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPov(dataConnect, createPovVars);

console.log(data.pov_insert);

// Or, you can use the `Promise` API.
createPov(createPovVars).then((response) => {
  const data = response.data;
  console.log(data.pov_insert);
});
```

### Using `CreatePOV`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPovRef, CreatePovVariables } from '@dataconnect/generated';

// The `CreatePOV` mutation requires an argument of type `CreatePovVariables`:
const createPovVars: CreatePovVariables = {
  name: ..., 
  customer: ..., 
  useCase: ..., 
};

// Call the `createPovRef()` function to get a reference to the mutation.
const ref = createPovRef(createPovVars);
// Variables can be defined inline as well.
const ref = createPovRef({ name: ..., customer: ..., useCase: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPovRef(dataConnect, createPovVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pov_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pov_insert);
});
```

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserRef:
```typescript
const name = upsertUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserVariables {
  email: string;
  displayName?: string | null;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@dataconnect/generated';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  email: ..., 
  displayName: ..., // optional
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ email: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@dataconnect/generated';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  email: ..., 
  displayName: ..., // optional
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ email: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## AddComment
You can execute the `AddComment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addComment(vars: AddCommentVariables): MutationPromise<AddCommentData, AddCommentVariables>;

interface AddCommentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCommentVariables): MutationRef<AddCommentData, AddCommentVariables>;
}
export const addCommentRef: AddCommentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addComment(dc: DataConnect, vars: AddCommentVariables): MutationPromise<AddCommentData, AddCommentVariables>;

interface AddCommentRef {
  ...
  (dc: DataConnect, vars: AddCommentVariables): MutationRef<AddCommentData, AddCommentVariables>;
}
export const addCommentRef: AddCommentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addCommentRef:
```typescript
const name = addCommentRef.operationName;
console.log(name);
```

### Variables
The `AddComment` mutation requires an argument of type `AddCommentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddCommentVariables {
  entityType: string;
  entityId: string;
  content: string;
}
```
### Return Type
Recall that executing the `AddComment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddCommentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddCommentData {
  comment_insert: Comment_Key;
}
```
### Using `AddComment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addComment, AddCommentVariables } from '@dataconnect/generated';

// The `AddComment` mutation requires an argument of type `AddCommentVariables`:
const addCommentVars: AddCommentVariables = {
  entityType: ..., 
  entityId: ..., 
  content: ..., 
};

// Call the `addComment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addComment(addCommentVars);
// Variables can be defined inline as well.
const { data } = await addComment({ entityType: ..., entityId: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addComment(dataConnect, addCommentVars);

console.log(data.comment_insert);

// Or, you can use the `Promise` API.
addComment(addCommentVars).then((response) => {
  const data = response.data;
  console.log(data.comment_insert);
});
```

### Using `AddComment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addCommentRef, AddCommentVariables } from '@dataconnect/generated';

// The `AddComment` mutation requires an argument of type `AddCommentVariables`:
const addCommentVars: AddCommentVariables = {
  entityType: ..., 
  entityId: ..., 
  content: ..., 
};

// Call the `addCommentRef()` function to get a reference to the mutation.
const ref = addCommentRef(addCommentVars);
// Variables can be defined inline as well.
const ref = addCommentRef({ entityType: ..., entityId: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addCommentRef(dataConnect, addCommentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.comment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.comment_insert);
});
```

## DeleteComment
You can execute the `DeleteComment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteComment(vars: DeleteCommentVariables): MutationPromise<DeleteCommentData, DeleteCommentVariables>;

interface DeleteCommentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCommentVariables): MutationRef<DeleteCommentData, DeleteCommentVariables>;
}
export const deleteCommentRef: DeleteCommentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteComment(dc: DataConnect, vars: DeleteCommentVariables): MutationPromise<DeleteCommentData, DeleteCommentVariables>;

interface DeleteCommentRef {
  ...
  (dc: DataConnect, vars: DeleteCommentVariables): MutationRef<DeleteCommentData, DeleteCommentVariables>;
}
export const deleteCommentRef: DeleteCommentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCommentRef:
```typescript
const name = deleteCommentRef.operationName;
console.log(name);
```

### Variables
The `DeleteComment` mutation requires an argument of type `DeleteCommentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCommentVariables {
  commentId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteComment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCommentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCommentData {
  comment_delete?: Comment_Key | null;
}
```
### Using `DeleteComment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteComment, DeleteCommentVariables } from '@dataconnect/generated';

// The `DeleteComment` mutation requires an argument of type `DeleteCommentVariables`:
const deleteCommentVars: DeleteCommentVariables = {
  commentId: ..., 
};

// Call the `deleteComment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteComment(deleteCommentVars);
// Variables can be defined inline as well.
const { data } = await deleteComment({ commentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteComment(dataConnect, deleteCommentVars);

console.log(data.comment_delete);

// Or, you can use the `Promise` API.
deleteComment(deleteCommentVars).then((response) => {
  const data = response.data;
  console.log(data.comment_delete);
});
```

### Using `DeleteComment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCommentRef, DeleteCommentVariables } from '@dataconnect/generated';

// The `DeleteComment` mutation requires an argument of type `DeleteCommentVariables`:
const deleteCommentVars: DeleteCommentVariables = {
  commentId: ..., 
};

// Call the `deleteCommentRef()` function to get a reference to the mutation.
const ref = deleteCommentRef(deleteCommentVars);
// Variables can be defined inline as well.
const ref = deleteCommentRef({ commentId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCommentRef(dataConnect, deleteCommentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.comment_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.comment_delete);
});
```

