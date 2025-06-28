import { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  Alert
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface DashboardStats {
  totalEmpresas: number;
  totalEstabelecimentos: number;
  totalSocios: number;
  totalSimples: number;
  empresasPorNaturezaJuridica: Array<{
    naturezaJuridica: string;
    count: number;
  }>;
  estabelecimentosPorUF: Array<{
    uf: string;
    count: number;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Em um cenário real, esta seria uma API específica para estatísticas
        // Por enquanto, vamos simular com dados estáticos
        
        // Simulação de resposta da API
        setTimeout(() => {
          const mockStats: DashboardStats = {
            totalEmpresas: 1250000,
            totalEstabelecimentos: 1500000,
            totalSocios: 3000000,
            totalSimples: 750000,
            empresasPorNaturezaJuridica: [
              { naturezaJuridica: 'EMPRESÁRIO INDIVIDUAL', count: 300000 },
              { naturezaJuridica: 'SOCIEDADE EMPRESÁRIA LIMITADA', count: 450000 },
              { naturezaJuridica: 'SOCIEDADE ANÔNIMA FECHADA', count: 120000 },
              { naturezaJuridica: 'SOCIEDADE ANÔNIMA ABERTA', count: 5000 },
              { naturezaJuridica: 'EIRELI', count: 200000 },
              { naturezaJuridica: 'OUTROS', count: 175000 },
            ],
            estabelecimentosPorUF: [
              { uf: 'SP', count: 350000 },
              { uf: 'RJ', count: 180000 },
              { uf: 'MG', count: 150000 },
              { uf: 'RS', count: 120000 },
              { uf: 'PR', count: 110000 },
              { uf: 'BA', count: 90000 },
              { uf: 'SC', count: 85000 },
              { uf: 'GO', count: 65000 },
              { uf: 'PE', count: 60000 },
              { uf: 'OUTROS', count: 290000 },
            ]
          };
          
          setStats(mockStats);
          setLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Não foi possível carregar as estatísticas do dashboard.');
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      
      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BusinessIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats?.totalEmpresas.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">
                Empresas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StoreIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" component="div">
                {stats?.totalEstabelecimentos.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">
                Estabelecimentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 48, mb: 1, color: '#ff9800' }} />
              <Typography variant="h5" component="div">
                {stats?.totalSocios.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">
                Sócios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 48, mb: 1, color: '#4caf50' }} />
              <Typography variant="h5" component="div">
                {stats?.totalSimples.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">
                Simples Nacional
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Empresas por Natureza Jurídica
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats?.empresasPorNaturezaJuridica}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="naturezaJuridica" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Quantidade" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estabelecimentos por UF
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats?.estabelecimentosPorUF}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="uf" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Quantidade" fill="#9c27b0" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
