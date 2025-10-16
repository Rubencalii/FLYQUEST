import React from 'react'

export default function FooterFlyQuest({ t }) {
  return (
    <footer className="mt-8 text-center text-sm text-flyquest-gray">
      <div className="flex items-center justify-center gap-4 mb-2">
        <a href="https://twitter.com/FlyQuest" target="_blank" rel="noreferrer">Twitter</a>
        <a href="https://www.instagram.com/flyquest/" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://www.youtube.com/c/FlyQuest" target="_blank" rel="noreferrer">YouTube</a>
        <a href="https://www.twitch.tv/flyquest" target="_blank" rel="noreferrer">Twitch</a>
      </div>
      <div>{t.footerText}</div>
    </footer>
  )
}
