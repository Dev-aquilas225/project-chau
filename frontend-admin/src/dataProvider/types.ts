export interface ResourceConfig {
  /** Path used to fetch the full list (bare array, no pagination). */
  listPath: string;
  /** Path used to fetch/write a single record. Defaults to `${listPath}/${id}`. */
  entityPath?: (id: string | number) => string;
  /** Filter keys the backend accepts as query params on the list endpoint. */
  serverFilterKeys?: string[];
  supportsCreate?: boolean;
  supportsDelete?: boolean;
}
