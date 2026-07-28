import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .min(1, "L’adresse e-mail est requise.")
  .email("Saisissez une adresse e-mail valide.")
  .max(254, "L’adresse e-mail est trop longue.")
  .transform((value) => value.toLowerCase())

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(72, "Le mot de passe ne peut pas dépasser 72 caractères.")
  .regex(/[a-z]/, "Ajoutez au moins une lettre minuscule.")
  .regex(/[A-Z]/, "Ajoutez au moins une lettre majuscule.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.")

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Le mot de passe est requis.")
    .max(72, "Le mot de passe ne peut pas dépasser 72 caractères."),
  next: z.string().optional(),
})

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(100, "Le nom ne peut pas dépasser 100 caractères."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal("on", {
      errorMap: () => ({
        message: "Vous devez accepter les conditions d’utilisation.",
      }),
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  })

export type LoginInput = z.input<typeof loginSchema>
export type RegisterInput = z.input<typeof registerSchema>
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>
