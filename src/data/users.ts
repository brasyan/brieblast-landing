// DEMO ONLY — passwords are plain text for prototyping.
// In production, NEVER store passwords in source code. Use a backend with hashed passwords.

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: string;
  memberSince: string;
}

export const USERS: User[] = [
  {
    id: "1",
    name: "Gouda Gary",
    email: "gary@brie.be",
    password: "cheddar123",
    plan: "Gouda Max",
    memberSince: "January 2025",
  },
  {
    id: "2",
    name: "Brie Beatrice",
    email: "beatrice@brie.be",
    password: "brie4ever",
    plan: "Cheddar Pro",
    memberSince: "March 2025",
  },
  {
    id: "3",
    name: "Emmental Eric",
    email: "eric@brie.be",
    password: "swiss_holes",
    plan: "Cheddar Pro",
    memberSince: "June 2025",
  },
];

export function findUser(email: string, password: string): User | null {
  return (
    USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    ) ?? null
  );
}
