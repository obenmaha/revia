import { z } from 'zod';

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schéma de validation pour l'inscription
export const registerSchema = z
  .object({
    email: z.string().min(1, "L'email est requis").email('Email invalide'),
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z
      .string()
      .min(1, 'La confirmation du mot de passe est requise'),
    firstName: z
      .string()
      .min(1, 'Le prénom est requis')
      .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z
      .string()
      .min(1, 'Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schéma de validation pour la réinitialisation de mot de passe
export const resetPasswordSchema = z.object({
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Schéma de validation pour le changement de mot de passe
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: z
      .string()
      .min(1, 'Le nouveau mot de passe est requis')
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    confirmNewPassword: z
      .string()
      .min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Schéma de validation pour la mise à jour du profil
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
