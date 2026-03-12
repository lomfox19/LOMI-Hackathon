import React from 'react';
import { Info, Cpu, Layers } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">About Platform</h2>
          <p className="text-xs text-purple-200">
            A modular medical AI assistant built on top of SVH Authentication.
          </p>
        </div>
      </header>

      <section className="space-y-2 text-sm text-purple-100">
        <p>
          This dashboard is designed as a secure workspace for authenticated
          users to interact with AI-assisted medical tools, manage their
          profile, and explore future modules such as imaging analysis and
          report generation.
        </p>
        <p>
          The architecture is intentionally modular: new features can be added as
          separate backend routes, controllers, and services, and corresponding
          frontend components can be plugged into the navigation without
          modifying core authentication code.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="bg-black/30 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-emerald-300" />
            <p className="text-sm font-semibold text-white">AI Ready</p>
          </div>
          <p className="text-xs text-purple-100">
            AI integrations are centralized in a dedicated service layer so that
            chatbot, symptom analysis, imaging, and reporting tools can reuse
            the same configuration and provider.
          </p>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-sky-300" />
            <p className="text-sm font-semibold text-white">Modular Design</p>
          </div>
          <p className="text-xs text-purple-100">
            Each feature lives in its own React component and backend route
            file. Future tools can be added by registering new modules without
            touching existing logic.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;

