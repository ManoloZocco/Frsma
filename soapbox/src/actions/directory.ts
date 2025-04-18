import api from '../api/index.ts';

import { fetchRelationships } from './accounts.ts';
import { importFetchedAccounts } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const DIRECTORY_FETCH_REQUEST = 'DIRECTORY_FETCH_REQUEST';
const DIRECTORY_FETCH_SUCCESS = 'DIRECTORY_FETCH_SUCCESS';
const DIRECTORY_FETCH_FAIL    = 'DIRECTORY_FETCH_FAIL';

const DIRECTORY_EXPAND_REQUEST = 'DIRECTORY_EXPAND_REQUEST';
const DIRECTORY_EXPAND_SUCCESS = 'DIRECTORY_EXPAND_SUCCESS';
const DIRECTORY_EXPAND_FAIL    = 'DIRECTORY_EXPAND_FAIL';

const fetchDirectory = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchDirectoryRequest());

    api(getState).get('/api/v1/directory', { searchParams: { ...params, limit: 20 } }).then((response) => response.json()).then((data) => {
      dispatch(importFetchedAccounts(data));
      dispatch(fetchDirectorySuccess(data));
      dispatch(fetchRelationships(data.map((x: APIEntity) => x.id)));
    }).catch(error => dispatch(fetchDirectoryFail(error)));
  };

const fetchDirectoryRequest = () => ({
  type: DIRECTORY_FETCH_REQUEST,
});

const fetchDirectorySuccess = (accounts: APIEntity[]) => ({
  type: DIRECTORY_FETCH_SUCCESS,
  accounts,
});

const fetchDirectoryFail = (error: unknown) => ({
  type: DIRECTORY_FETCH_FAIL,
  error,
});

const expandDirectory = (params: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(expandDirectoryRequest());

    const loadedItems = getState().user_lists.directory.items.size;

    api(getState).get('/api/v1/directory', { searchParams: { ...params, offset: loadedItems, limit: 20 } }).then((response) => response.json()).then((data) => {
      dispatch(importFetchedAccounts(data));
      dispatch(expandDirectorySuccess(data));
      dispatch(fetchRelationships(data.map((x: APIEntity) => x.id)));
    }).catch(error => dispatch(expandDirectoryFail(error)));
  };

const expandDirectoryRequest = () => ({
  type: DIRECTORY_EXPAND_REQUEST,
});

const expandDirectorySuccess = (accounts: APIEntity[]) => ({
  type: DIRECTORY_EXPAND_SUCCESS,
  accounts,
});

const expandDirectoryFail = (error: unknown) => ({
  type: DIRECTORY_EXPAND_FAIL,
  error,
});

export {
  DIRECTORY_FETCH_REQUEST,
  DIRECTORY_FETCH_SUCCESS,
  DIRECTORY_FETCH_FAIL,
  DIRECTORY_EXPAND_REQUEST,
  DIRECTORY_EXPAND_SUCCESS,
  DIRECTORY_EXPAND_FAIL,
  fetchDirectory,
  fetchDirectoryRequest,
  fetchDirectorySuccess,
  fetchDirectoryFail,
  expandDirectory,
  expandDirectoryRequest,
  expandDirectorySuccess,
  expandDirectoryFail,
};