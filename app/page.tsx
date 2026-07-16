export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
          Mobile and Web Developer
        </p>

        <h1 className="mt-5 text-5xl font-bold md:text-7xl">
          Hi, I&apos;m Andrei.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          I develop mobile and web applications focused on public safety,
          education, sustainability, and community development.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#projects"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            View My Projects
          </a>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-600 px-6 py-3 font-semibold transition hover:border-white"
          >
            View Résumé
          </a>
        </div>
      </section>

      <section
        id="projects"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <h2 className="text-3xl font-bold">Featured Projects</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-2xl font-semibold">Ignis Safe</h3>

            <p className="mt-3 leading-7 text-slate-300">
              A mobile fire-safety education application with assessments,
              learning materials, user progress tracking, and interactive
              Unity simulations.
            </p>

            <p className="mt-5 text-sm text-blue-400">
              Flutter · Unity · Supabase
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-2xl font-semibold">NU Freelance</h3>

            <p className="mt-3 leading-7 text-slate-300">
              A student-focused platform designed to connect users with
              freelance opportunities and digital services.
            </p>

            <p className="mt-5 text-sm text-blue-400">
              Web Development · Database · Responsive UI
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}