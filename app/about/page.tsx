import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from '../../components/FadeIn';

export default function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <FadeIn>
        <section className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
        <div className="flex-1 space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            About Satchel Baskette
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Expert LSAT tutoring tailored to your goals
          </h1>
          <p className="text-lg leading-relaxed text-slate-600">
            I help students approach the LSAT with efficient strategies, diverse materials, and the confidence to perform on test day.
          </p>
        </div>
        {/* Headshot */}
        <div className="flex-1">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="aspect-[4/5] relative">
              <Image
                src="/about/satchel_headshot.jpg?v=2"
                alt="Satchel Baskette - LSAT Tutor"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* About Me */}
      <FadeIn>
        <section className="space-y-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">About Me</h2>
        <div className="space-y-4 text-lg leading-relaxed text-slate-600">
          <p>
            Hi! My name is Satchel Baskette, and I am a current pre-law student at the University of Washington. I began my LSAT journey in June, 2025. After just over three months of intensive self-guided study, I earned a 177 in October. Though the process was initially often frustrating, I developed strategies and methods that helped me view the LSAT as a much more manageable (and even enjoyable) endeavor. I hope I’ll have the opportunity to share these tactics with you!
          </p>
        </div>
      </section>
      </FadeIn>

      {/* Teaching Approach */}
      <FadeIn>
        <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Teaching Approach</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delayMs={0} className="h-full">
            <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Focus on Efficiency</h3>
            <p className="text-slate-600 leading-relaxed">
              My approach is focused on viewing the LSAT with efficiency in mind. I help you develop the ability to move through each LSAT section quickly and accurately.
            </p>
            </div>
          </FadeIn>
          <FadeIn delayMs={90} className="h-full">
            <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Diverse Materials</h3>
            <p className="text-slate-600 leading-relaxed">
              Everyone learns differently, so I make an effort to provide a wide range of materials including recorded lectures, written answer keys, and practice problems.
            </p>
            </div>
          </FadeIn>
          <FadeIn delayMs={180} className="h-full">
            <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Preventing Burn-Out</h3>
            <p className="text-slate-600 leading-relaxed">
              The LSAT can seem like an overwhelming test, and it’s easy to get burnt out. It is critical to find ways to make LSAT preparation enjoyable, and I share some of the ways I have found to make this possible.
            </p>
            </div>
          </FadeIn>
          <FadeIn delayMs={270} className="h-full">
            <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Test-Day Confidence</h3>
            <p className="text-slate-600 leading-relaxed">
              Your LSAT score is based just as much on your level of confidence as it is on your mastery of content. I help you find mental strategies to ensure you feel confident and prepared on test day.
            </p>
            </div>
          </FadeIn>
        </div>
      </section>
      </FadeIn>

      {/* Specializations */}
      <FadeIn>
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
      </FadeIn>

      {/* CTA */}
      <FadeIn>
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
      </FadeIn>
    </div>
  );
}

