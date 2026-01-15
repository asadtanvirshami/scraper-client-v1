export type GenericResponse = {
  code: number;
  success: boolean;
  message: string;
  data: any;
  redirect: string | null;
};
