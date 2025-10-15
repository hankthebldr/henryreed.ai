# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreatePov, useUpsertUser, useAddComment, useDeleteComment, useListPoVs, useListUsers, useListUserPoVs, useGetPovById, useSearchPoVs } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreatePov(createPovVars);

const { data, isPending, isSuccess, isError, error } = useUpsertUser(upsertUserVars);

const { data, isPending, isSuccess, isError, error } = useAddComment(addCommentVars);

const { data, isPending, isSuccess, isError, error } = useDeleteComment(deleteCommentVars);

const { data, isPending, isSuccess, isError, error } = useListPoVs();

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useListUserPoVs();

const { data, isPending, isSuccess, isError, error } = useGetPovById(getPovByIdVars);

const { data, isPending, isSuccess, isError, error } = useSearchPoVs(searchPoVsVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createPov, upsertUser, addComment, deleteComment, listPoVs, listUsers, listUserPoVs, getPovById, searchPoVs } from '@dataconnect/generated';


// Operation CreatePOV:  For variables, look at type CreatePovVars in ../index.d.ts
const { data } = await CreatePov(dataConnect, createPovVars);

// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation AddComment:  For variables, look at type AddCommentVars in ../index.d.ts
const { data } = await AddComment(dataConnect, addCommentVars);

// Operation DeleteComment:  For variables, look at type DeleteCommentVars in ../index.d.ts
const { data } = await DeleteComment(dataConnect, deleteCommentVars);

// Operation ListPOVs: 
const { data } = await ListPoVs(dataConnect);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation ListUserPOVs: 
const { data } = await ListUserPoVs(dataConnect);

// Operation GetPOVById:  For variables, look at type GetPovByIdVars in ../index.d.ts
const { data } = await GetPovById(dataConnect, getPovByIdVars);

// Operation SearchPOVs:  For variables, look at type SearchPoVsVars in ../index.d.ts
const { data } = await SearchPoVs(dataConnect, searchPoVsVars);


```