const phrases = [
  "🧀 GOUDA HOSTING",
  "⚡ BLAZINGLY FAST",
  "🇧🇪 PROUDLY BELGIAN",
  "🔥 NO CAP",
  "💪 BUILT DIFFERENT",
  "🚀 TO THE MOON",
  "🧀 BRIE-LLIANT UPTIME",
  "😤 WE DON'T MISS",
];

const MarqueeSection = () => {
  const content = phrases.join(" • ");

  return (
    <div className="py-6 border-y border-border overflow-hidden bg-muted/30">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="text-xl font-bold text-primary/60 mx-4">{content} • {content} • </span>
        <span className="text-xl font-bold text-primary/60 mx-4">{content} • {content} • </span>
      </div>
    </div>
  );
};

export default MarqueeSection;
