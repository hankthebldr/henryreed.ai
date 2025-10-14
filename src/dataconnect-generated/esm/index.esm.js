import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'henryreedai',
  location: 'us-east1'
};

export const listPoVsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPOVs');
}
listPoVsRef.operationName = 'ListPOVs';

export function listPoVs(dc) {
  return executeQuery(listPoVsRef(dc));
}

export const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';

export function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
}

export const listUserPoVsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserPOVs');
}
listUserPoVsRef.operationName = 'ListUserPOVs';

export function listUserPoVs(dc) {
  return executeQuery(listUserPoVsRef(dc));
}

export const getPovByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPOVById', inputVars);
}
getPovByIdRef.operationName = 'GetPOVById';

export function getPovById(dcOrVars, vars) {
  return executeQuery(getPovByIdRef(dcOrVars, vars));
}

export const searchPoVsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchPOVs', inputVars);
}
searchPoVsRef.operationName = 'SearchPOVs';

export function searchPoVs(dcOrVars, vars) {
  return executeQuery(searchPoVsRef(dcOrVars, vars));
}

export const createPovRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePOV', inputVars);
}
createPovRef.operationName = 'CreatePOV';

export function createPov(dcOrVars, vars) {
  return executeMutation(createPovRef(dcOrVars, vars));
}

export const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';

export function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
}

export const addCommentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddComment', inputVars);
}
addCommentRef.operationName = 'AddComment';

export function addComment(dcOrVars, vars) {
  return executeMutation(addCommentRef(dcOrVars, vars));
}

export const deleteCommentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteComment', inputVars);
}
deleteCommentRef.operationName = 'DeleteComment';

export function deleteComment(dcOrVars, vars) {
  return executeMutation(deleteCommentRef(dcOrVars, vars));
}

