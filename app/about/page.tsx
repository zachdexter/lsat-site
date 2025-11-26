import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
        <div className="flex-1 space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            About Satchel Baskette
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Expert LSAT tutoring tailored to your goals
          </h1>
          <p className="text-lg leading-relaxed text-slate-600">
            With years of experience helping students achieve their target LSAT scores, 
            I focus on building the skills and confidence you need to succeed on test day.
          </p>
        </div>
        {/* Headshot */}
        <div className="flex-1">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="aspect-[4/5] relative">
              <Image
                src="/about/satchel_headshot.jpg?v=2"
                alt="Satchel Basket - LSAT Tutor"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Background & Experience */}
      <section className="space-y-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Background & Experience</h2>
        <div className="space-y-4 text-lg leading-relaxed text-slate-600">
          <p>
            [Add your LSAT score, educational background, and years of tutoring experience here]
          </p>
          <p>
            [Include any relevant achievements, certifications, or specializations]
          </p>
        </div>
      </section>

      {/* Teaching Approach */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Teaching Approach</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Personalized Strategy</h3>
            <p className="text-slate-600 leading-relaxed">
              Every student is different. I work with you to identify your strengths and 
              weaknesses, then develop a customized study plan that targets the areas 
              where you'll see the biggest score improvements.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Focus on Fundamentals</h3>
            <p className="text-slate-600 leading-relaxed">
              Strong LSAT performance comes from mastering the basics. We'll build a solid 
              foundation in logic, reasoning patterns, and timing strategies that apply 
              across all three sections of the test.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Practice & Feedback</h3>
            <p className="text-slate-600 leading-relaxed">
              Regular practice with targeted feedback helps you understand not just what 
              you got wrong, but why—and how to avoid similar mistakes in the future.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Test-Day Confidence</h3>
            <p className="text-slate-600 leading-relaxed">
              Beyond content knowledge, I help you develop the mental strategies and 
              confidence needed to perform your best under the pressure of test day.
            </p>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="space-y-6 rounded-2xl border-2 border-indigo-100 bg-white p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Areas of Focus</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              LG
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Logic Games</h3>
              <p className="text-sm text-slate-600">Master diagramming and game types</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              LR
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Logical Reasoning</h3>
              <p className="text-sm text-slate-600">Build argument analysis skills</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              RC
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Reading Comprehension</h3>
              <p className="text-sm text-slate-600">Improve speed and accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 md:p-10 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">Ready to improve your LSAT score?</h2>
        <p className="mb-6 text-lg text-indigo-100">
          Book a session to discuss your goals and create a personalized study plan.
        </p>
        <Link
          href="/book"
          className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 transition-all hover:bg-indigo-50 hover:shadow-lg"
        >
          Book a session
        </Link>
      </section>
    </div>
  );
}

