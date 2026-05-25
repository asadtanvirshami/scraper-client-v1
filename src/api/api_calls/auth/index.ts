import { GenericResponse } from "@/types/api";
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

export async function Login(input: {
  email: string;
  password: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.signin, input);
  return data;
}

export async function GoogleSignIn (input: {
  credentials: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.google, input);
  return data;
}

export async function ResendOTP(input: {
  email: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.resendOtp, input);
  return data;
}

export async function ForgotPassword(input: {
  email: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.forgot_password, input);
  return data;
}

export async function ResetPassword(input: {
  email: string;
  otp: string;
  newPassword?: string;
  password?: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.reset_password, {
    email: input.email.trim().toLowerCase(),
    otp: input.otp.trim(),
    newPassword: input.newPassword ?? input.password,
  });
  return data;
}
