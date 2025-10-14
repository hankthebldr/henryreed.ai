# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { listPoVs, listUsers, listUserPoVs, getPovById, searchPoVs, createPov, upsertUser, addComment, deleteComment } from '@dataconnect/generated';


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

// Operation CreatePOV:  For variables, look at type CreatePovVars in ../index.d.ts
const { data } = await CreatePov(dataConnect, createPovVars);

// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation AddComment:  For variables, look at type AddCommentVars in ../index.d.ts
const { data } = await AddComment(dataConnect, addCommentVars);

// Operation DeleteComment:  For variables, look at type DeleteCommentVars in ../index.d.ts
const { data } = await DeleteComment(dataConnect, deleteCommentVars);


```