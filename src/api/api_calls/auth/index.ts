import axios from "axios";
import { GenericResponse } from "../type";
import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";

export async function Register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.signup, input);
  return data;
}

export async function VerifyOTP(input: {
  email: string;
  otp: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.verifyOtp, input);
  return data;
}