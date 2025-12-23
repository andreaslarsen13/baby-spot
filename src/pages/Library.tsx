import React from 'react';
import { Link } from 'react-router-dom';
import { getAllComponents } from '@/components/library/registry';

const Library: React.FC = () => {
  const components = getAllComponents();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Component Library</h1>
          <p className="text-lg text-zinc-400">Catalog of all component versions and designs</p>
        </header>

        {/* UI Kit Link */}
        <Link
          to="/ui"
          className="block mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 hover:bg-zinc-900/50 transition-colors"
        >
          <h2 className="text-2xl font-bold text-white mb-2">UI Kit →</h2>
          <p className="text-zinc-400">Core design building blocks: buttons, cards, icons</p>
        </Link>

        <div className="space-y-8">
          {components.map((component) => (
            <div
              key={component.name}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-white mb-2">{component.name}</h2>
                <p className="text-zinc-400">{component.description}</p>
              </div>

              <div className="space-y-4">
                {component.versions.map((version) => (
                  <div
                    key={version.version}
                    className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-[#FE3400]/20 text-[#FE3400] text-sm font-medium">
                          {version.version}
                        </span>
                        <span className="text-zinc-300 font-medium">{version.description}</span>
                      </div>
                    </div>
                    <ul className="space-y-1 ml-2">
                      {version.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-zinc-500 flex items-start gap-2">
                          <span className="text-zinc-600 mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <h3 className="text-lg font-semibold text-white mb-2">How to Add a New Version</h3>
          <ol className="space-y-2 text-zinc-400 text-sm list-decimal list-inside">
            <li>Create a new file: <code className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">src/components/library/[ComponentName]/v[N].tsx</code></li>
            <li>Export your component from the new file</li>
            <li>Add it to the versions object in <code className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">index.tsx</code></li>
            <li>Update the registry in <code className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">registry.ts</code> with version info</li>
            <li>Change <code className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">DEFAULT_VERSION</code> to switch active version</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Library;
