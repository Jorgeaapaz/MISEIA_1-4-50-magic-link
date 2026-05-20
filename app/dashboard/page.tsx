"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Magik Link</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Bienvenido
          </h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{user.email}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Informacion del usuario</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">User ID</dt>
              <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">{user.userId}</dd>
            </div>
            {user.createdAt && (
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Miembro desde</dt>
                <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                  {new Date(user.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            )}
            {user.lastLoginAt && (
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ultimo acceso</dt>
                <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                  {new Date(user.lastLoginAt).toLocaleString("es-ES")}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </main>
    </div>
  );
}
