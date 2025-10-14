import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ActivityLog_Key {
  id: UUIDString;
  __typename?: 'ActivityLog_Key';
}

export interface AddCommentData {
  comment_insert: Comment_Key;
}

export interface AddCommentVariables {
  entityType: string;
  entityId: string;
  content: string;
}

export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreatePovData {
  pov_insert: Pov_Key;
}

export interface CreatePovVariables {
  name: string;
  customer: string;
  useCase: string;
}

export interface DeleteCommentData {
  comment_delete?: Comment_Key | null;
}

export interface DeleteCommentVariables {
  commentId: UUIDString;
}

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

export interface GetPovByIdVariables {
  id: UUIDString;
}

export interface ListPoVsData {
  povs: ({
    id: UUIDString;
    name: string;
    customer: string;
    industry?: string | null;
    status: string;
  } & Pov_Key)[];
}

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

export interface ListUsersData {
  users: ({
    id: string;
    email: string;
    displayName?: string | null;
  } & User_Key)[];
}

export interface Pov_Key {
  id: UUIDString;
  __typename?: 'Pov_Key';
}

export interface Scenario_Key {
  id: UUIDString;
  __typename?: 'Scenario_Key';
}

export interface SearchPoVsData {
  povs: ({
    id: UUIDString;
    name: string;
    customer: string;
    status: string;
    priority?: string | null;
  } & Pov_Key)[];
}

export interface SearchPoVsVariables {
  nameInput?: string | null;
  customer?: string | null;
}

export interface Template_Key {
  id: UUIDString;
  __typename?: 'Template_Key';
}

export interface Trr_Key {
  id: UUIDString;
  __typename?: 'Trr_Key';
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  email: string;
  displayName?: string | null;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface ListPoVsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPoVsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPoVsData, undefined>;
  operationName: string;
}
export const listPoVsRef: ListPoVsRef;

export function listPoVs(): QueryPromise<ListPoVsData, undefined>;
export function listPoVs(dc: DataConnect): QueryPromise<ListPoVsData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

interface ListUserPoVsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserPoVsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUserPoVsData, undefined>;
  operationName: string;
}
export const listUserPoVsRef: ListUserPoVsRef;

export function listUserPoVs(): QueryPromise<ListUserPoVsData, undefined>;
export function listUserPoVs(dc: DataConnect): QueryPromise<ListUserPoVsData, undefined>;

interface GetPovByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPovByIdVariables): QueryRef<GetPovByIdData, GetPovByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPovByIdVariables): QueryRef<GetPovByIdData, GetPovByIdVariables>;
  operationName: string;
}
export const getPovByIdRef: GetPovByIdRef;

export function getPovById(vars: GetPovByIdVariables): QueryPromise<GetPovByIdData, GetPovByIdVariables>;
export function getPovById(dc: DataConnect, vars: GetPovByIdVariables): QueryPromise<GetPovByIdData, GetPovByIdVariables>;

interface SearchPoVsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchPoVsVariables): QueryRef<SearchPoVsData, SearchPoVsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: SearchPoVsVariables): QueryRef<SearchPoVsData, SearchPoVsVariables>;
  operationName: string;
}
export const searchPoVsRef: SearchPoVsRef;

export function searchPoVs(vars?: SearchPoVsVariables): QueryPromise<SearchPoVsData, SearchPoVsVariables>;
export function searchPoVs(dc: DataConnect, vars?: SearchPoVsVariables): QueryPromise<SearchPoVsData, SearchPoVsVariables>;

interface CreatePovRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePovVariables): MutationRef<CreatePovData, CreatePovVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePovVariables): MutationRef<CreatePovData, CreatePovVariables>;
  operationName: string;
}
export const createPovRef: CreatePovRef;

export function createPov(vars: CreatePovVariables): MutationPromise<CreatePovData, CreatePovVariables>;
export function createPov(dc: DataConnect, vars: CreatePovVariables): MutationPromise<CreatePovData, CreatePovVariables>;

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface AddCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCommentVariables): MutationRef<AddCommentData, AddCommentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddCommentVariables): MutationRef<AddCommentData, AddCommentVariables>;
  operationName: string;
}
export const addCommentRef: AddCommentRef;

export function addComment(vars: AddCommentVariables): MutationPromise<AddCommentData, AddCommentVariables>;
export function addComment(dc: DataConnect, vars: AddCommentVariables): MutationPromise<AddCommentData, AddCommentVariables>;

interface DeleteCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCommentVariables): MutationRef<DeleteCommentData, DeleteCommentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCommentVariables): MutationRef<DeleteCommentData, DeleteCommentVariables>;
  operationName: string;
}
export const deleteCommentRef: DeleteCommentRef;

export function deleteComment(vars: DeleteCommentVariables): MutationPromise<DeleteCommentData, DeleteCommentVariables>;
export function deleteComment(dc: DataConnect, vars: DeleteCommentVariables): MutationPromise<DeleteCommentData, DeleteCommentVariables>;

