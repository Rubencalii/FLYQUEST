import React from 'react'

export default function FooterFlyQuest({ t }) {
  const socialLinks = [
    { name: 'Twitter', emoji: '🐦', url: 'https://twitter.com/FlyQuest', color: 'hover:text-blue-400' },
    { name: 'Instagram', emoji: '📸', url: 'https://www.instagram.com/flyquest/', color: 'hover:text-pink-400' },
    { name: 'YouTube', emoji: '▶️', url: 'https://www.youtube.com/c/FlyQuest', color: 'hover:text-red-400' },
    { name: 'Twitch', emoji: '🎮', url: 'https://www.twitch.tv/flyquest', color: 'hover:text-purple-400' }
  ]

  return (
    <footer className="mt-8 text-center text-sm text-flyquest-gray">
      <div className="flex items-center justify-center gap-6 mb-4">
        {socialLinks.map(social => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${social.color}`}
            title={social.name}
          >
            <span className="text-2xl">{social.emoji}</span>
            <span className="text-xs opacity-75">{social.name}</span>
          </a>
        ))}
      </div>
      <div className="text-flyquest-gray/80">{t.footerText}</div>
    </footer>
  )
}
