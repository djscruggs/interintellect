import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 bg-white">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          AI-Powered Matching
        </span>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl mb-6 leading-tight">
          Find the right fit —<br className="hidden sm:block" /> faster
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          Job seekers get matched to roles that actually fit their skills. Companies find
          candidates who are genuinely qualified — not just keyword matches.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">Get started free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">Sign in</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create your profile",
                body: "Job seekers add their skills, experience, and desired role. Companies describe their team and post jobs.",
              },
              {
                step: "2",
                title: "AI scans the matches",
                body: "Our AI reads both sides carefully — skills, experience level, remote preference — and scores the fit.",
              },
              {
                step: "3",
                title: "See why you matched",
                body: "Every match includes a plain-English explanation so you know exactly why it was suggested.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to find your match?</h2>
        <p className="text-blue-100 mb-8 max-w-md mx-auto">
          Free to use. No credit card required.
        </p>
        <Link href="/register">
          <Button size="lg" variant="secondary">Create your account</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-4 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} JobMatch. Built with AI.
      </footer>
    </div>
  );
}
