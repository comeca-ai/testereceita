import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import axios from 'axios';
// import { CNPJProcessor } from 'cnpj-core';

interface Estabelecimento {
  cnpj: string;
  cnpjBase: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  dataSituacaoCadastral: string;
  cnaePrincipal: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  tipo: string;
  dataInicioAtividade: string;
  cnaesSecundarios: Array<{ codigo: string }>;
  empresa?: {
    razaoSocial: string;
    naturezaJuridica: string;
    porte: string;
  };
}

const EstabelecimentoDetails = () => {
  const { cnpj } = useParams<{ cnpj: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);

  useEffect(() => {
    const fetchEstabelecimentoDetails = async () => {
      if (!cnpj) {
        setError('CNPJ não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Em um cenário real, esta seria uma chamada à API
        // Por enquanto, vamos simular com dados estáticos
        
        // Simulação de resposta da API
        setTimeout(() => {
          const mockEstabelecimento: Estabelecimento = {
            cnpj: cnpj,
            cnpjBase: cnpj.substring(0, 8),
            nomeFantasia: 'ESTABELECIMENTO DEMONSTRAÇÃO',
            situacaoCadastral: '2', // ATIVA
            dataSituacaoCadastral: '2010-05-15',
            cnaePrincipal: '6201500',
            logradouro: 'RUA EXEMPLO',
            numero: '123',
            complemento: 'SALA 456',
            bairro: 'CENTRO',
            municipio: 'SÃO PAULO',
            uf: 'SP',
            cep: '01001000',
            email: 'contato@empresa.com.br',
            telefone: '1133334444',
            tipo: 'MATRIZ',
            dataInicioAtividade: '2010-05-15',
            cnaesSecundarios: [
              { codigo: '6202300' },
              { codigo: '6209100' },
              { codigo: '6311900' }
            ],
            empresa: {
              razaoSocial: 'EMPRESA DEMONSTRAÇÃO LTDA',
              naturezaJuridica: 'SOCIEDADE EMPRESÁRIA LIMITADA',
              porte: 'DEMAIS'
            }
          };
          
          setEstabelecimento(mockEstabelecimento);
          setLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error('Erro ao buscar detalhes do estabelecimento:', err);
        setError('Não foi possível carregar os detalhes do estabelecimento.');
        setLoading(false);
      }
    };

    fetchEstabelecimentoDetails();
  }, [cnpj]);

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatCNPJ = (cnpj: string) => {
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) {
      return cnpj; // Retorna o original se não tiver 14 dígitos
    }
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    return cleanCNPJ.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const getSituacaoCadastralLabel = (codigo: string) => {
    const situacoes: Record<string, string> = {
      '1': 'NULA',
      '2': 'ATIVA',
      '3': 'SUSPENSA',
      '4': 'INAPTA',
      '8': 'BAIXADA',
    };
    return situacoes[codigo] || codigo;
  };

  const getSituacaoCadastralColor = (codigo: string) => {
    const cores: Record<string, string> = {
      '1': 'error',
      '2': 'success',
      '3': 'warning',
      '4': 'error',
      '8': 'error',
    };
    return cores[codigo] as 'error' | 'success' | 'warning' | 'info';
  };

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

  if (!estabelecimento) {
    return <Alert severity="info">Nenhum dado encontrado para este CNPJ.</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/estabelecimentos"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          {estabelecimento.nomeFantasia || 'Estabelecimento sem nome fantasia'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Informações Gerais
              </Typography>
              <Chip
                label={getSituacaoCadastralLabel(estabelecimento.situacaoCadastral)}
                color={getSituacaoCadastralColor(estabelecimento.situacaoCadastral)}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">CNPJ</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCNPJ(estabelecimento.cnpj)}
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Tipo
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {estabelecimento.tipo}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Data de Início de Atividade</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatData(estabelecimento.dataInicioAtividade)}
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Data da Situação Cadastral
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatData(estabelecimento.dataSituacaoCadastral)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Atividades Econômicas
            </Typography>

            <Typography variant="subtitle2">CNAE Principal</Typography>
            <Typography variant="body1" gutterBottom>
              {estabelecimento.cnaePrincipal}
            </Typography>

            {estabelecimento.cnaesSecundarios.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  CNAEs Secundários
                </Typography>
                <List dense>
                  {estabelecimento.cnaesSecundarios.map((cnae, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={cnae.codigo} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Endereço
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body1">
                  {estabelecimento.logradouro}, {estabelecimento.numero}
                  {estabelecimento.complemento ? ` - ${estabelecimento.complemento}` : ''}
                </Typography>
                <Typography variant="body1">
                  {estabelecimento.bairro}
                </Typography>
                <Typography variant="body1">
                  {estabelecimento.municipio} - {estabelecimento.uf}
                </Typography>
                <Typography variant="body1">
                  CEP: {estabelecimento.cep}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>

            {estabelecimento.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  {estabelecimento.email}
                </Typography>
              </Box>
            )}

            {estabelecimento.telefone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  {estabelecimento.telefone}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Empresa
                </Typography>
              </Box>

              {estabelecimento.empresa ? (
                <>
                  <Typography variant="subtitle2">Razão Social</Typography>
                  <Typography variant="body1" gutterBottom>
                    {estabelecimento.empresa.razaoSocial}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Natureza Jurídica
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {estabelecimento.empresa.naturezaJuridica}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Porte
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {estabelecimento.empresa.porte}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      component={Link}
                      to={`/empresas/${estabelecimento.cnpjBase}`}
                      variant="outlined"
                      size="small"
                    >
                      Ver Empresa
                    </Button>
                  </Box>
                </>
              ) : (
                <Alert severity="info">
                  Informações da empresa não disponíveis.
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                component={Link}
                to={`/search?cnpj=${estabelecimento.cnpj}`}
              >
                Consulta Detalhada
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => window.print()}
              >
                Imprimir Informações
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EstabelecimentoDetails;
