import { useNavigate, useLocation } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import CollectionsIcon from '@mui/icons-material/Collections'
import StarIcon from '@mui/icons-material/Star'

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Home', path: '/', id: 'home', icon: <HomeIcon className="nav-icon" /> },
    { label: 'Browse', path: '/browse', id: 'browse', icon: <LibraryBooksIcon className="nav-icon" /> },
    { label: 'Catalog', path: '/catalog', id: 'catalog', icon: <CollectionsIcon className="nav-icon" /> },
    { label: 'Rate', path: '/rate', id: 'rate', icon: <StarIcon className="nav-icon" /> }
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
