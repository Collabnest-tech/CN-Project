import { useState } from 'react'
import Link from 'next/link'

export default function DropdownNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative h-full">
      <button
        className="m-4 px-4 py-2 bg-purple-700 text-white rounded shadow hover:bg-purple-800"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close Menu' : 'Open Menu'}
      </button>
      {open && (
        <nav className="absolute left-4 top-16 w-56 bg-white shadow-lg flex flex-col py-8 px-4 space-y-4 z-50 rounded">
          <Link href="/dashboard">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Dashboard</a>
          </Link>
          <Link href="/courses">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Courses</a>
          </Link>
          <Link href="/profile-referrals">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">My Profile & Referrals</a>
          </Link>
          <Link href="/">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Home</a>
          </Link>
          <Link href="/login">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Log Out</a>
          </Link>
        </nav>
      )}
    </div>
  )
}