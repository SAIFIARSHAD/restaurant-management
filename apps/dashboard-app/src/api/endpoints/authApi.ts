import api from "../axios";
import type { User } from "../../types";

interface LoginPayload {
  email: string;
  password: string;
}

// Match Backend exact response 
interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload),

  getProfile: () =>
    api.get<User>("/auth/profile"),
};
