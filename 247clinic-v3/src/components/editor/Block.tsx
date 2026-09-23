import React from 'react';

export default function Block({ name }: { name: string }) {
  const [type, id] = name.split('-');

  if (type === 'TextImg') {
    return (
      <section id={name} className="py-16 slot">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-display mb-4">New Text Block</h2>
            <p className="text-lg">Edit this text to match your content.</p>
          </div>
          <div className="bg-gray-100 aspect-video rounded-lg slot-img flex items-center justify-center">
            <span className="text-gray-400">Image Slot</span>
          </div>
        </div>
      </section>
    );
  }

  if (type === 'FullImg') {
    return (
      <section id={name} className="slot">
        <div className="bg-gray-100 aspect-[21/9] w-full slot-img flex items-center justify-center">
          <span className="text-gray-400">Full Width Image</span>
        </div>
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-500">Caption text goes here</p>
        </div>
      </section>
    );
  }

  if (type === 'LogoRow') {
    return (
      <section id={name} className="py-12 bg-surface slot">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl mb-8">Our Partners</h3>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 slot-img">
            <span>[Logo]</span>
            <span>[Logo]</span>
            <span>[Logo]</span>
          </div>
        </div>
      </section>
    );
  }

  return <section id={name} className="py-8"><div className="container">Unknown block type</div></section>;
}
