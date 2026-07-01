const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || "https://syspharma-backend.onrender.com";

const normalizeBaseUrl = (value) => {
  if (!value) return DEFAULT_BASE_URL;
  return String(value).trim().replace(/\/+$/, "").replace(/\/api$/i, "");
};

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_URL || DEFAULT_BASE_URL);

const getSeedValue = (user) => {
  const candidates = [
    user?.nombre,
    user?.nombres,
    user?.email,
    user?.correo,
    user?.id,
    user?.documento,
  ];

  const resolved = candidates.find((value) => value !== undefined && value !== null && value !== "");
  return resolved ?? "user";
};

export const getFotoPerfilUrl = (user, fallbackName) => {
  const avatarValue = user?.avatar || user?.fotoPerfil || user?.foto || user?.foto_perfil;

  if (!avatarValue) {
    const seed = fallbackName || getSeedValue(user);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(seed))}`;
  }

  if (/^https?:\/\//i.test(avatarValue) || avatarValue.startsWith("data:")) {
    return avatarValue;
  }

  const normalizedPath = String(avatarValue).trim();
  const path = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  return `${API_BASE}${path}`;
};
