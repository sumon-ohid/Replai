export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
}
