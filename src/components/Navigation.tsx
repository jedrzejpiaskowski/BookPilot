import { useNavigate, useLocation } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Home', path: '/', id: 'home', icon: <HomeIcon className="nav-icon" /> },
    { label: 'Browse', path: '/browse', id: 'browse' },
    { label: 'Catalog', path: '/catalog', id: 'catalog' },
    { label: 'Rate', path: '/rate', id: 'rate' }
  ]

  const handleClick = (path: string) => {
    navigate(path)
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleClick(item.path)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
