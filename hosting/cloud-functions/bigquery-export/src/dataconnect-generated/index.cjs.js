const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'henryreedai',
  location: 'us-east1'
};
exports.connectorConfig = connectorConfig;

const listPoVsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPOVs');
}
listPoVsRef.operationName = 'ListPOVs';
exports.listPoVsRef = listPoVsRef;

exports.listPoVs = function listPoVs(dc) {
  return executeQuery(listPoVsRef(dc));
};

const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';
exports.listUsersRef = listUsersRef;

exports.listUsers = function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
};

const listUserPoVsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserPOVs');
}
listUserPoVsRef.operationName = 'ListUserPOVs';
exports.listUserPoVsRef = listUserPoVsRef;

exports.listUserPoVs = function listUserPoVs(dc) {
  return executeQuery(listUserPoVsRef(dc));
};

const getPovByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPOVById', inputVars);
}
getPovByIdRef.operationName = 'GetPOVById';
exports.getPovByIdRef = getPovByIdRef;

exports.getPovById = function getPovById(dcOrVars, vars) {
  return executeQuery(getPovByIdRef(dcOrVars, vars));
};

const searchPoVsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchPOVs', inputVars);
}
searchPoVsRef.operationName = 'SearchPOVs';
exports.searchPoVsRef = searchPoVsRef;

exports.searchPoVs = function searchPoVs(dcOrVars, vars) {
  return executeQuery(searchPoVsRef(dcOrVars, vars));
};

const createPovRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePOV', inputVars);
}
createPovRef.operationName = 'CreatePOV';
exports.createPovRef = createPovRef;

exports.createPov = function createPov(dcOrVars, vars) {
  return executeMutation(createPovRef(dcOrVars, vars));
};

const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';
exports.upsertUserRef = upsertUserRef;

exports.upsertUser = function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
};

const addCommentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddComment', inputVars);
}
addCommentRef.operationName = 'AddComment';
exports.addCommentRef = addCommentRef;

exports.addComment = function addComment(dcOrVars, vars) {
  return executeMutation(addCommentRef(dcOrVars, vars));
};

const deleteCommentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteComment', inputVars);
}
deleteCommentRef.operationName = 'DeleteComment';
exports.deleteCommentRef = deleteCommentRef;

exports.deleteComment = function deleteComment(dcOrVars, vars) {
  return executeMutation(deleteCommentRef(dcOrVars, vars));
};
