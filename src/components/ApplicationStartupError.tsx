interface IProps {
  error: unknown
}

/** Shows a visible failure instead of a blank page when application bootstrapping fails. */
export const ApplicationStartupError = ({ error }: IProps) => {
  const message = error instanceof Error ? error.message : "An unknown startup error occurred."

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section
        aria-labelledby="startup-error-title"
        className="max-w-lg border bg-card p-6 shadow-sm"
      >
        <h1
          id="startup-error-title"
          className="text-lg font-semibold"
        >
          The application could not start
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Refresh the page and try again.</p>
        <p
          role="alert"
          className="mt-4 break-words border-l-2 border-destructive pl-3 font-mono text-xs text-muted-foreground"
        >
          {message}
        </p>
      </section>
    </main>
  )
}
