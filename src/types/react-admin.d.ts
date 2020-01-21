import {Component, ElementType, ComponentType, ReactElement, ReactNode} from "react";
import {match} from "react-router-dom";

export class Admin extends Component<AdminProps> {}
export class Resource extends Component<ResourceProps> {}
export class List extends Component<any> {}
export class ListGuesser extends Component<ReactAdminComponentProps> {}
export class Datagrid extends Component<any> {}
export class TextField extends Component<any> {}
export class NumberField extends Component<any> {}
export class DateField extends Component<any> {}

/*
 * Everything below this modified from
 * https://github.com/marmelab/react-admin/blob/master/packages/ra-core/src/types.ts
 *
 * Copyright (c) 2016-present, Francois Zaninotto, Marmelab
 */

export type Identifier = string | number;
export interface Record {
    id: Identifier;
    [key: string]: any;
}
export interface RecordMap<RecordType = Record> {
    [id: string]: RecordType;
    [id: number]: RecordType;
}

export interface Sort {
    field: string;
    order: string;
}
export interface Pagination {
    page: number;
    perPage: number;
}
export const I18N_TRANSLATE = 'I18N_TRANSLATE';
export const I18N_CHANGE_LOCALE = 'I18N_CHANGE_LOCALE';
export type Translate = (key: string, options?: any) => string;
export type I18nProvider = {
    translate: Translate;
    changeLocale: (locale: string, options?: any) => Promise<void>;
    getLocale: () => string;
    [key: string]: any;
};
export type AuthProvider = {
    login: (params: any) => Promise<any>;
    logout: (params: any) => Promise<void | string>;
    checkAuth: (params: any) => Promise<void>;
    checkError: (error: any) => Promise<void>;
    getPermissions: (params: any) => Promise<any>;
    [key: string]: any;
};
export type LegacyAuthProvider = (
    type: any,
    params?: any
) => Promise<any>;
export type DataProvider = {
    getList: (
        resource: string,
        params: GetListParams
    ) => Promise<GetListResult>;

    getOne: (resource: string, params: GetOneParams) => Promise<GetOneResult>;

    getMany: (
        resource: string,
        params: GetManyParams
    ) => Promise<GetManyResult>;

    getManyReference: (
        resource: string,
        params: GetManyReferenceParams
    ) => Promise<GetManyReferenceResult>;

    update: (resource: string, params: UpdateParams) => Promise<UpdateResult>;

    updateMany: (
        resource: string,
        params: UpdateManyParams
    ) => Promise<UpdateManyResult>;

    create: (resource: string, params: CreateParams) => Promise<CreateResult>;

    delete: (resource: string, params: DeleteParams) => Promise<DeleteResult>;

    deleteMany: (
        resource: string,
        params: DeleteManyParams
    ) => Promise<DeleteManyResult>;

    [key: string]: any;
};
export interface GetListParams {
    pagination: Pagination;
    sort: Sort;
    filter: any;
}
export interface GetListResult {
    data: Record[];
    total: number;
}
export interface GetOneParams {
    id: Identifier;
}
export interface GetOneResult {
    data: Record;
}
export interface GetManyParams {
    ids: Identifier[];
}
export interface GetManyResult {
    data: Record[];
}

export interface GetManyReferenceParams {
    target: string;
    id: Identifier;
    pagination: Pagination;
    sort: Sort;
    filter: any;
}
export interface GetManyReferenceResult {
    data: Record[];
    total: number;
}
export interface UpdateParams {
    id: Identifier;
    data: any;
    previousData: Record;
}
export interface UpdateResult {
    data: Record;
}
export interface UpdateManyParams {
    ids: Identifier[];
    data: any;
}
export interface UpdateManyResult {
    data?: Identifier[];
}
export interface CreateParams {
    data: any;
}
export interface CreateResult {
    data: Record;
}
export interface DeleteParams {
    id: Identifier;
}
export interface DeleteResult {
    data?: Record;
}
export interface DeleteManyParams {
    ids: Identifier[];
}
export interface DeleteManyResult {
    data?: Identifier[];
}
export type DataProviderProxy = {
    getList: (
        resource: string,
        params: GetListParams,
        options?: UseDataProviderOptions
    ) => Promise<GetListResult>;

    getOne: (
        resource: string,
        params: GetOneParams,
        options?: UseDataProviderOptions
    ) => Promise<GetOneResult>;

    getMany: (
        resource: string,
        params: GetManyParams,
        options?: UseDataProviderOptions
    ) => Promise<GetManyResult>;

    getManyReference: (
        resource: string,
        params: GetManyReferenceParams,
        options?: UseDataProviderOptions
    ) => Promise<GetManyReferenceResult>;

    update: (
        resource: string,
        params: UpdateParams,
        options?: UseDataProviderOptions
    ) => Promise<UpdateResult>;

    updateMany: (
        resource: string,
        params: UpdateManyParams,
        options?: UseDataProviderOptions
    ) => Promise<UpdateManyResult>;

    create: (
        resource: string,
        params: CreateParams,
        options?: UseDataProviderOptions
    ) => Promise<CreateResult>;

    delete: (
        resource: string,
        params: DeleteParams,
        options?: UseDataProviderOptions
    ) => Promise<DeleteResult>;

    deleteMany: (
        resource: string,
        params: DeleteManyParams,
        options?: UseDataProviderOptions
    ) => Promise<DeleteManyResult>;

    [key: string]: any;
};
export interface UseDataProviderOptions {
    action?: string;
    fetch?: string;
    meta?: object;
    undoable?: boolean;
    onSuccess?: any;
    onFailure?: any;
}
export type LegacyDataProvider = (
    type: string,
    resource: string,
    params: any
) => Promise<any>;
export interface ReduxState {
    admin: {
        ui: {
            optimistic: boolean;
            sidebarOpen: boolean;
            viewVersion: number;
        };
        resources: {
            [name: string]: {
                data: any;
                list: {
                    params: any;
                    ids: Identifier[];
                    loadedOnce: boolean;
                    selectedIds: Identifier[];
                    total: number;
                };
            };
        };
        references: {
            oneToMany: {
                [relatedTo: string]: { ids: Identifier[]; total: number };
            };
        };
        loading: number;
        customQueries: {
            [key: string]: any;
        };
    };
    router: {
        location: Location;
    };
}
export type InitialState = object | (() => object);
export type Dispatch<T> = T extends (...args: infer A) => any
    ? (...args: A) => void
    : never;

export type ResourceElement = ReactElement<ResourceProps>;
export type RenderResourcesFunction = (
    permissions: any
) => ResourceElement[] | Promise<ResourceElement[]>;
export type AdminChildren = RenderResourcesFunction | ReactNode;
export type CustomRoutes = Array<ReactElement<any>>;
export type TitleComponent = string | ReactElement<any>;
export type CatchAllComponent = Component<{ title?: TitleComponent }>;
export type LoginComponent = ComponentType<any>;
export type DashboardComponent = ComponentType<any>;
export interface LayoutProps {
    dashboard?: DashboardComponent;
    logout: ReactNode;
    menu: ComponentType;
    theme: object;
    title?: TitleComponent;
}
export type LayoutComponent = ComponentType<LayoutProps>;
export interface ReactAdminComponentProps {
    basePath: string;
    permissions?: any;
}
export interface ReactAdminComponentPropsWithId {
    basePath: string;
    permissions?: any;
    id: Identifier;
}
export type ResourceMatch = match<{
    id?: string;
}>;
export interface ResourceProps {
    intent?: 'route' | 'registration';
    match?: ResourceMatch;
    name: string;
    list?: ComponentType<ReactAdminComponentProps>;
    create?: ComponentType<ReactAdminComponentProps>;
    edit?: ComponentType<ReactAdminComponentPropsWithId>;
    show?: ComponentType<ReactAdminComponentPropsWithId>;
    icon?: ComponentType<any>;
    options?: object;
}
export interface AdminProps {
    appLayout?: LayoutComponent;
    authProvider?: AuthProvider | LegacyAuthProvider;
    catchAll?: CatchAllComponent;
    children?: AdminChildren;
    customReducers?: object;
    customRoutes?: CustomRoutes;
    customSagas?: any[];
    dashboard?: DashboardComponent;
    dataProvider: DataProvider | LegacyDataProvider;
    history?: History;
    i18nProvider?: I18nProvider;
    initialState?: InitialState;
    layout?: LayoutComponent;
    loading?: ComponentType;
    locale?: string;
    loginPage?: LoginComponent | boolean;
    logoutButton?: ComponentType;
    menu?: ComponentType;
    theme?: object;
    title?: TitleComponent;
}
export type Exporter = (
    data: any,
    fetchRelatedRecords: (
        data: any,
        field: string,
        resource: string
    ) => Promise<any>,
    dataProvider: DataProvider,
    resource?: string
) => Promise<void>;
