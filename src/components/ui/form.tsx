// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type * as LabelPrimitive from "@radix-ui/react-label";

// <== LABEL COMPONENT ==>
import { Label } from "@/components/ui/label";

// <== FORM COMPONENT ==>
const Form = FormProvider;

// <== FORM FIELD CONTEXT ==>
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  // <== FORM FIELD NAME ==>
  name: TName;
};

// <== FORM FIELD CONTEXT ==>
const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

// <== FORM FIELD COMPONENT ==>
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  // RETURNING FORM FIELD COMPONENT
  return (
    // OPENING FORM FIELD CONTEXT
    <FormFieldContext.Provider value={{ name: props.name }}>
      {/* CONTROLLER */}
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// <== FORM ITEM CONTEXT ==>
type FormItemContextValue = {
  // <== FORM ITEM ID ==>
  id: string;
};

// <== FORM ITEM CONTEXT ==>
const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

// <== USE FORM FIELD HOOK ==>
const useFormField = () => {
  // FORM FIELD CONTEXT
  const fieldContext = React.useContext(FormFieldContext);
  // FORM ITEM CONTEXT
  const itemContext = React.useContext(FormItemContext);
  // GET FIELD STATE
  const { getFieldState } = useFormContext();
  // FORM STATE
  const formState = useFormState({ name: fieldContext.name });
  // FIELD STATE
  const fieldState = getFieldState(fieldContext.name, formState);
  // CHECK IF FIELD CONTEXT IS AVAILABLE
  if (!fieldContext) {
    // THROW ERROR
    throw new Error("useFormField should be used within <FormField>");
  }
  // FORM ITEM ID
  const { id } = itemContext;
  // RETURN FORM FIELD STATE
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// <== FORM ITEM COMPONENT ==>
const FormItem = ({ className, ...props }: React.ComponentProps<"div">) => {
  // FORM ITEM ID
  const id = React.useId();
  // RETURNING FORM ITEM COMPONENT
  return (
    // OPENING FORM ITEM CONTEXT
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
};

// <== FORM LABEL COMPONENT ==>
const FormLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) => {
  // FORM FIELD STATE
  const { error, formItemId } = useFormField();
  // RETURNING FORM LABEL COMPONENT
  return (
    // OPENING FORM LABEL
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};

// <== FORM CONTROL COMPONENT ==>
const FormControl = ({ ...props }: React.ComponentProps<typeof Slot>) => {
  // FORM FIELD STATE
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();
  // RETURNING FORM CONTROL COMPONENT
  return (
    // OPENING FORM CONTROL
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
};

// <== FORM DESCRIPTION COMPONENT ==>
const FormDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => {
  // FORM FIELD STATE
  const { formDescriptionId } = useFormField();
  // RETURNING FORM DESCRIPTION COMPONENT
  return (
    // OPENING FORM DESCRIPTION
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};

// <== FORM MESSAGE COMPONENT ==>
const FormMessage = ({ className, ...props }: React.ComponentProps<"p">) => {
  // FORM FIELD STATE
  const { error, formMessageId } = useFormField();
  // BODY
  const body = error ? String(error?.message ?? "") : props.children;
  // CHECK IF BODY IS AVAILABLE
  if (!body) {
    // RETURN NULL
    return null;
  }
  // OPENING FORM MESSAGE
  return (
    // OPENING FORM MESSAGE
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
};

// <== EXPORTING FORM COMPONENTS ==>
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
