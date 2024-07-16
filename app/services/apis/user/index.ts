import { toast } from "react-toastify";
import { UserRoutes, loginRoutes } from "../../apiRoutes";
import axiosInstance from "../../axiosInstance";

export const LoginApi = async (params?: any) => {
  try {
    const response = await axiosInstance.post(`${loginRoutes.login}`, params);
    return response?.data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it further if needed
  }
};

export const RegisterApi = async (params?: any) => {
    try {
      const response = await axiosInstance.post(`${loginRoutes.register}`, params);
      return response?.data;
    } catch (error) {
      throw error; // Re-throw the error to propagate it further if needed
    }
  };


export const getAllUserAPi = async (params?: any) => {
  try {
    const response = await axiosInstance.get(`${UserRoutes.getAllUser}`);
    return response?.data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it further if needed
  }
};
export const getUserByIdAPi = async (id?: any) => {
  try {
    const response = await axiosInstance.get(`${UserRoutes.getUserById}${id}`);
    return response?.data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it further if needed
  }
};

export const LogoutApi = async (id?: any) => {
  try {
    const response = await axiosInstance.post(`${UserRoutes.logout}${id}`);
    return response?.data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it further if needed
  }
};

export const getChatApi = async (id?: any) => {
  try {
    const response = await axiosInstance.post(`${UserRoutes.getchats}`, { id });
    return response?.data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it further if needed
  }
};
