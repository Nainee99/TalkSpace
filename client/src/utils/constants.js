export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTHROUTES = "api/auth";
export const SIGNUP_ROUTE = `${AUTHROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTHROUTES}/login`;
export const GET_USER_INFO = `${AUTHROUTES}/user-info`;
export const UPDATE_PROFILE_ROUTE = `${AUTHROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE_ROUTE = `${AUTHROUTES}/add-profile-image`;

export const LOGOUT_ROUTE = `${AUTHROUTES}/logout`;