const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
  "auth/user-not-found": "E-mail ou mot de passe incorrect.",
  "auth/wrong-password": "E-mail ou mot de passe incorrect.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/invalid-email": "Adresse e-mail invalide.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
  "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
};

export function toFirebaseAuthErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return FIREBASE_ERROR_MESSAGES[error.code] ?? "Erreur d'authentification.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Erreur d'authentification.";
}
