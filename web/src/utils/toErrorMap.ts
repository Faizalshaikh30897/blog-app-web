import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]): Record<string, string> => {
  const errorMap: Record<string, string> = {};
  errors.forEach(({ field, messsage }) => {
    errorMap[field] = messsage;
  });
  return errorMap;
};
