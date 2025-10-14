import { ListPoVsData, ListUsersData, ListUserPoVsData, GetPovByIdData, GetPovByIdVariables, SearchPoVsData, SearchPoVsVariables, CreatePovData, CreatePovVariables, UpsertUserData, UpsertUserVariables, AddCommentData, AddCommentVariables, DeleteCommentData, DeleteCommentVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListPoVs(options?: useDataConnectQueryOptions<ListPoVsData>): UseDataConnectQueryResult<ListPoVsData, undefined>;
export function useListPoVs(dc: DataConnect, options?: useDataConnectQueryOptions<ListPoVsData>): UseDataConnectQueryResult<ListPoVsData, undefined>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useListUserPoVs(options?: useDataConnectQueryOptions<ListUserPoVsData>): UseDataConnectQueryResult<ListUserPoVsData, undefined>;
export function useListUserPoVs(dc: DataConnect, options?: useDataConnectQueryOptions<ListUserPoVsData>): UseDataConnectQueryResult<ListUserPoVsData, undefined>;

export function useGetPovById(vars: GetPovByIdVariables, options?: useDataConnectQueryOptions<GetPovByIdData>): UseDataConnectQueryResult<GetPovByIdData, GetPovByIdVariables>;
export function useGetPovById(dc: DataConnect, vars: GetPovByIdVariables, options?: useDataConnectQueryOptions<GetPovByIdData>): UseDataConnectQueryResult<GetPovByIdData, GetPovByIdVariables>;

export function useSearchPoVs(vars?: SearchPoVsVariables, options?: useDataConnectQueryOptions<SearchPoVsData>): UseDataConnectQueryResult<SearchPoVsData, SearchPoVsVariables>;
export function useSearchPoVs(dc: DataConnect, vars?: SearchPoVsVariables, options?: useDataConnectQueryOptions<SearchPoVsData>): UseDataConnectQueryResult<SearchPoVsData, SearchPoVsVariables>;

export function useCreatePov(options?: useDataConnectMutationOptions<CreatePovData, FirebaseError, CreatePovVariables>): UseDataConnectMutationResult<CreatePovData, CreatePovVariables>;
export function useCreatePov(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePovData, FirebaseError, CreatePovVariables>): UseDataConnectMutationResult<CreatePovData, CreatePovVariables>;

export function useUpsertUser(options?: useDataConnectMutationOptions<UpsertUserData, FirebaseError, UpsertUserVariables>): UseDataConnectMutationResult<UpsertUserData, UpsertUserVariables>;
export function useUpsertUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertUserData, FirebaseError, UpsertUserVariables>): UseDataConnectMutationResult<UpsertUserData, UpsertUserVariables>;

export function useAddComment(options?: useDataConnectMutationOptions<AddCommentData, FirebaseError, AddCommentVariables>): UseDataConnectMutationResult<AddCommentData, AddCommentVariables>;
export function useAddComment(dc: DataConnect, options?: useDataConnectMutationOptions<AddCommentData, FirebaseError, AddCommentVariables>): UseDataConnectMutationResult<AddCommentData, AddCommentVariables>;

export function useDeleteComment(options?: useDataConnectMutationOptions<DeleteCommentData, FirebaseError, DeleteCommentVariables>): UseDataConnectMutationResult<DeleteCommentData, DeleteCommentVariables>;
export function useDeleteComment(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCommentData, FirebaseError, DeleteCommentVariables>): UseDataConnectMutationResult<DeleteCommentData, DeleteCommentVariables>;
