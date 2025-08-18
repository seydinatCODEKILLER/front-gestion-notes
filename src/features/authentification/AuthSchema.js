import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "6 caractères minimum"),
});

export const RegisterSchema = LoginSchema.extend({
  username: z.string().min(3, "3 caractères minimum"),
  role: z.enum(["admin", "boutiquier", "client"]),
});

export const validateAuthData = (data, schema = LoginSchema) => {
  try {
    schema.parse(data);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      errors: error.flatten().fieldErrors,
    };
  }
};
