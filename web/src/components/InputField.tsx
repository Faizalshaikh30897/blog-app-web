import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean;
  numOfRows?:number;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  numOfRows,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);
  let ComponentInput: any = Input;
  if (textarea) {
    ComponentInput = Textarea;
  }
  return (
    
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <ComponentInput {...field} {...props} id={field.name} rows={textarea && numOfRows ? numOfRows : undefined} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
