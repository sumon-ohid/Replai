export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
}