import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ResponsivePie } from '@nivo/pie'



export default function App() {
  const [count, setCount] = useState(0)
  const [chartData, setChartData] = useState([])
  const [chartData1, setChartData1] = useState([])
  const [chartData2, setChartData2] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState(null)




  // Login handler
  async function handleLogin(e) {
    e.preventDefault()
    const form = e.target
    const email = form.email.value.trim()
    const password = form.password.value
    const clan_tag = form.clan_tag.value.trim()
    setLoginError(null)
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, clan_tag })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Login failed')
      setLoggedIn(true)
    } catch (err) {
      console.error('Login error', err)
      setLoginError(String(err))
    }
  }

  useEffect(() => {
    if (!loggedIn) return

    async function load() {
      console.log('fetching /war_stats')
      try {
        const res = await fetch(`http://localhost:8000/war_stats`)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        const warStats = json.warStats ?? json
        const ourName = warStats.ourName || "Our Clan"
        const opponentName = warStats.opponentName || "Opponent Clan"
        console.log('Backend response:', warStats) // Debug: see actual shape
        document.getElementById('WarVerses').innerText = `${ourName} vs ${opponentName}`
        // If warStats.ourStars, etc. are arrays, extract the first element
        setChartData([
          { id: 'Our Stars', label: 'Our Stars', value: Array.isArray(warStats.ourStars) ? warStats.ourStars[0] : warStats.ourStars ?? 0 },
          { id: 'Opponent Stars', label: 'Opponent Stars', value: Array.isArray(warStats.opponentStars) ? warStats.opponentStars[0] : warStats.opponentStars ?? 0 },
          { id: 'Remaining Stars', label: 'Remaining Stars', value: Array.isArray(warStats.remainingStars) ? warStats.remainingStars[0] : warStats.remainingStars ?? 0 },
        ])
        setChartData1([
          { id: 'Our Attacks', label: 'Our Attacks', value: Array.isArray(warStats.ourAttacksUsed) ? warStats.ourAttacksUsed[0] : warStats.ourAttacksUsed ?? 0 },
          { id: 'Opponent Attacks', label: 'Opponent Attacks', value: Array.isArray(warStats.opponentAttacksUsed) ? warStats.opponentAttacksUsed[0] : warStats.opponentAttacksUsed ?? 0 },
        ])
        setChartData2([
          { id: 'Our Destruction', label: 'Our Destruction', value: Array.isArray(warStats.ourDestruction) ? warStats.ourDestruction[0] : warStats.ourDestruction ?? 0 },
          { id: 'Opponent Destruction', label: 'Opponent Destruction', value: Array.isArray(warStats.opponentDestruction) ? warStats.opponentDestruction[0] : warStats.opponentDestruction ?? 0 },
        ])
        setLastUpdated(new Date().toISOString())
      } catch (err) {
        console.error('Failed to load clan data', err)
      } finally {
        setLoading(false)
      }
    }

    // Load immediately on login
    load()

    // Set up interval to refresh every 60 seconds
    const interval = setInterval(load, 60000)

    // Cleanup function to clear interval when component unmounts or logout
    return () => clearInterval(interval)
  }, [loggedIn])

  if (!loggedIn) {
    return (
      <div className="login">
        <h1>Login to Clan API</h1>
        <form onSubmit={handleLogin}>
          <label>Email:<br /><input name="email" type="email" required /></label><br />
          <label>Password:<br /><input name="password" type="password" required /></label><br />
          <label>Clan Tag:<br /><input name="clan_tag" type="text" placeholder="#CLANTAG" required /></label><br />
          <button type="submit">Login</button>
        </form>
        {loginError && <p className="error">{loginError}</p>}
      </div>
    )
  }

  return (
    <>
      <h1>Clash Of Clans Dashboard</h1>
      <div className="card">
        <p id="WarVerses"></p>
      </div>
      <div className="charts-row">
      <div className="chart" style={{ height: 500 }}>
        <ResponsivePie
          data={loading ? [{ id: 'loading', label: 'loading', value: 1 }] : chartData}
          margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        activeOuterRadiusOffset={5}
        colors={{ scheme: 'yellow_orange_brown' }}
        borderWidth={1}
        borderColor="#ffffff"
        enableArcLinkLabels={false}
        arcLabelsTextColor="#000000"
        isInteractive={false}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 8,
              itemWidth: 100,
              itemHeight: 18,
              itemDirection: 'left-to-right',
              symbolSize: 18,
              symbolShape: 'circle',
              itemTextColor: '#ffffff',
            },
          ]}
        />
      </div>
      <div className="chart" style={{ height: 500 }}>
        <ResponsivePie
          data={loading ? [{ id: 'loading', label: 'loading', value: 1 }] : chartData1}
          margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        activeOuterRadiusOffset={5}
        colors={{ scheme: 'nivo' }}
        borderWidth={1}
        borderColor="#ffffff"
        enableArcLinkLabels={false}
        arcLabelsTextColor="#000000"
        isInteractive={false}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 8,
              itemWidth: 100,
              itemHeight: 18,
              itemDirection: 'left-to-right',
              symbolSize: 18,
              symbolShape: 'circle',
              itemTextColor: '#ffffff',
            },
          ]}
        />
      </div>
      <div className="chart" style={{ height: 500 }}>
        <ResponsivePie
          data={loading ? [{ id: 'loading', label: 'loading', value: 1 }] : chartData2}
          margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        activeOuterRadiusOffset={5}
        colors={{ scheme: 'paired' }}
        borderWidth={1}
        borderColor="#ffffff"
        enableArcLinkLabels={false}
        arcLabelsTextColor="#000000"
        isInteractive={false}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 8,
              itemWidth: 100,
              itemHeight: 18,
              itemDirection: 'left-to-right',
              symbolSize: 18,
              symbolShape: 'circle',
              itemTextColor: '#ffffff',
            },
          ]}
        />
        </div>
        </div>
          </>
  )
}

