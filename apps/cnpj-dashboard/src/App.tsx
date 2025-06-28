import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import EmpresasList from './pages/empresas/EmpresasList';
import EmpresaDetails from './pages/empresas/EmpresaDetails';
import EstabelecimentosList from './pages/estabelecimentos/EstabelecimentosList';
import EstabelecimentoDetails from './pages/estabelecimentos/EstabelecimentoDetails';
import SociosList from './pages/socios/SociosList';
import SocioDetails from './pages/socios/SocioDetails';
import SimplesList from './pages/simples/SimplesList';
import SimplesDetails from './pages/simples/SimplesDetails';
import CNPJSearch from './pages/search/CNPJSearch';
import About from './pages/About';

const App = () => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header open={open} toggleDrawer={toggleDrawer} />
      <Sidebar open={open} toggleDrawer={toggleDrawer} />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/empresas" element={<EmpresasList />} />
            <Route path="/empresas/:cnpjBase" element={<EmpresaDetails />} />
            <Route path="/estabelecimentos" element={<EstabelecimentosList />} />
            <Route path="/estabelecimentos/:cnpj" element={<EstabelecimentoDetails />} />
            <Route path="/socios" element={<SociosList />} />
            <Route path="/socios/:id" element={<SocioDetails />} />
            <Route path="/simples" element={<SimplesList />} />
            <Route path="/simples/:cnpjBase" element={<SimplesDetails />} />
            <Route path="/search" element={<CNPJSearch />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
