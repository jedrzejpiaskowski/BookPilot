import { Container, Box, Typography } from '@mui/material'
import './App.css'

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          BookPilot
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your personal book reading planner
        </Typography>
      </Box>
    </Container>
  )
}

export default App
