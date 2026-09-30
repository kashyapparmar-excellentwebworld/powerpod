import * as Yup from "yup";
import { 
  loginValidationSchema, 
  forgotPasswordValidationSchema, 
  resetPasswordValidationSchema 
} from "../validations";

export type LoginValues = Yup.InferType<typeof loginValidationSchema>;
export type ForgotPasswordValues = Yup.InferType<typeof forgotPasswordValidationSchema>;
export type ResetPasswordValues = Yup.InferType<typeof resetPasswordValidationSchema>;
