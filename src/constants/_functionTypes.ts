//Functions types described here are meant for overriding the regular typescript 'Function' type when using a function
//as a callback between functions or classes. Typescript wraps the basic 'Function' in an eval() which is strictly
//prohibiting within Chrome web extensions, using the types below overrides this issue.

//Assistant page callback
export type assistantCallbackFunction = (data: any) => void;

//Generating a session for dashboardStore
export type generateType = () => void;

//Follower functions for dashboardStore
export type responseType = (response: any, name: string, id: string, key: string|null) => void;
export type disconnectedType = (UUID: string) => void;
export type addedType = (snapshot: any, id: string) => void;
export type readIceCandidateType = (snapshot: any, UUID: string) => void;

//Follower tab functions for dashboardStore
export type tabChangedType = (response: any, followerId: string, key: string) => void;
export type tabRemovedType = (followerId: string, key: string) => void;
export type tabsAddedType = (response: any, followerId: string) => void;