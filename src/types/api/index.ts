export interface GenericResponse<T = any> {
  code: number;
  success: boolean;
  message: string;
  data: T;
  redirect: string | null;
  pagination: any;
}