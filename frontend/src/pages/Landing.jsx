import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-ai-bg text-ai-primary flex items-center justify-center px-6 py-10 font-body relative overflow-hidden">
      {/* Subtle AI background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 w-80 h-80 bg-gradient-to-br from-ai-secondary/10 via-ai-secondary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-gradient-to-tr from-ai-primary/10 via-ai-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-60 mix-blend-multiply">
          <div className="w-full h-full bg-[radial-gradient(circle_at_0_0,#2E7D5B11,transparent_55%),radial-gradient(circle_at_100%_100%,#0F3D2E11,transparent_55%)]" />
        </div>
      </div>

      <div className="relative max-w-6xl w-full grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
        {/* Left: Logo + copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 shadow-sm border border-ai-primary/10">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ai-primary text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </span>
            <p className="text-xs font-medium tracking-wide text-ai-primary/80">
              Intelligent, secure, AI-powered medical assistant
            </p>
          </div>

          <div className="space-y-5">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl leading-tight text-ai-primary">
              Your trusted
              <span className="block text-ai-secondary">
                AI Medical Companion
              </span>
            </h1>
            <p className="max-w-xl text-base sm:text-lg text-ai-primary/75">
              Securely explore symptoms, understand your medical data, and chat with an AI assistant designed for healthcare insights.
              Authentication is powered by SVH to keep your data safe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="inline-flex items-center justify-center rounded-[999px] bg-ai-primary text-white px-7 py-3 text-sm sm:text-base font-semibold shadow-lg shadow-ai-primary/30 hover:bg-ai-hover transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.button>

            <div className="text-xs sm:text-sm text-ai-primary/70">
              <p className="font-medium">No data is shared without your control.</p>
              <p>Continue to secure login to access your dashboard.</p>
            </div>
          </div>
        </motion.div>

        {/* Right: AI visual card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="relative"
        >
          <div className="relative rounded-xl-card bg-white/70 backdrop-blur-xl border border-ai-primary/10 shadow-ai-card px-6 py-7 sm:px-8 sm:py-9 overflow-hidden">
            <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-ai-secondary/40 via-ai-secondary/0 to-transparent blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-ai-primary/40 via-ai-primary/0 to-transparent blur-3xl" />

            <div className="relative space-y-6">
              {/* Logo placeholder */}
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-ai-primary flex items-center justify-center text-white font-semibold shadow-md">
                  MA
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-ai-primary/60">
                    Project Logo
                  </p>
                  <p className="text-sm font-semibold text-ai-primary">
                    Medical AI Assistant
                  </p>
                </div>
              </div>

              {/* Neural network style visual */}
              <div className="relative rounded-xl-card bg-ai-bg/60 border border-ai-primary/10 p-4 sm:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0,#2E7D5B22,transparent_55%),radial-gradient(circle_at_100%_80%,#0F3D2E1A,transparent_55%)] opacity-80" />
                <div className="relative space-y-3">
                  <p className="text-xs font-medium tracking-wide text-ai-primary/70">
                    Live AI Insight Preview
                  </p>
                  <p className="text-sm text-ai-primary/80">
                    “Based on your described symptoms, I&apos;ll highlight potential
                    areas of concern and guide you with questions your clinician
                    might ask.”
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="px-3 py-1 rounded-full bg-white/70 text-ai-primary/80 border border-ai-primary/10">
                      Symptom clustering
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/70 text-ai-primary/80 border border-ai-primary/10">
                      Risk hints
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/70 text-ai-primary/80 border border-ai-primary/10">
                      Follow‑up questions
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] text-ai-primary/70">
                <div className="rounded-xl bg-white/80 border border-ai-primary/10 px-3 py-2">
                  <p className="font-semibold text-xs text-ai-primary mb-1">
                    Secure by design
                  </p>
                  <p>Authentication handled via SVH, with dedicated dashboard access.</p>
                </div>
                <div className="rounded-xl bg-white/80 border border-ai-primary/10 px-3 py-2">
                  <p className="font-semibold text-xs text-ai-primary mb-1">
                    AI‑first experience
                  </p>
                  <p>Chatbot, medical form, and profile tools unified in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;

