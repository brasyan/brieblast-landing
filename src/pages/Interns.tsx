import React from 'react';
import NavBar from '../components/NavBar';
import FooterSection from '../components/FooterSection';

const Interns = () => {
  const interns = [
    { name: 'Model A', task: 'Generates memes and jokes.' },
    { name: 'Model B', task: 'Assists with conversations and banter.' },
    { name: 'Model C', task: 'Creates silly animations.' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <h1 className="text-2xl font-bold text-center mt-4">Meet Our AI Interns</h1>
        <ul className="list-disc pl-5 mt-4">
          {interns.map((intern) => (
            <li key={intern.name} className="text-lg">
              <strong>{intern.name}</strong>: {intern.task}
            </li>
          ))}
        </ul>
      </main>
      <FooterSection />
    </div>
  );
};

export default Interns;